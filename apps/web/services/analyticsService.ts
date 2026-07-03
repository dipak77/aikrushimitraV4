import { ActivityLog, UserProfile } from "../types";
import { generateUUID } from "../utils/common";
import { analytics, auth, db, handleFirestoreError, OperationType } from "../utils/firebase";
import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { signInAnonymously } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";


// ─── Constants ───────────────────────────────────────────────────────────────
const SESSION_KEY = "app_current_session";
const MAX_LOG_RESULTS = 500;
const ACTIVE_THRESHOLD_MS = 30 * 60 * 1000;  // 30 min
const MIN_SESSION_DURATION_MS = 30 * 1000;  // 30 sec
const MAX_STRING_LEN = 200;

/**
 * Backwards-compatible password hash export.
 *
 * SECURITY NOTE: This is intentionally kept to avoid breaking existing
 * import sites, but real authentication should be handled via Firebase
 * Auth on the server. The returned hash is a non-reversible token,
 * NOT a secure password store.
 */
export const TARGET_HASH =
  "2cbe8647b64b21c8594834a08de83034f1ba340d443741a0c3c1e8e946a576d9";

export const hashPassword = async (password: string): Promise<string> => {
  if (window.crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch (e) {
      console.error("[hashPassword] Crypto error:", e);
    }
  }
  return "invalid_hash_fallback";
};


// ─── Utilities ────────────────────────────────────────────────────────────────
const sanitize = (
  str: string | undefined | null,
  fallback = "Unknown"
): string => {
  if (!str || typeof str !== "string") return fallback;
  return str.slice(0, MAX_STRING_LEN).replace(/[<>]/g, "").trim() || fallback;
};

const getDeviceDetails = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform || "";
  let device = "Desktop";
  let os = "Unknown";

  if (/Android/i.test(ua)) {
    os = "Android";
    device = /Mobile/i.test(ua) ? "Mobile" : "Tablet";
  } else if (/iPhone/i.test(ua)) {
    os = "iOS";
    device = "Mobile";
  } else if (/iPad/i.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    // iPadOS 13+ reports as desktop MacIntel
    os = "iOS";
    device = "Tablet";
  } else if (/Windows/i.test(ua)) {
    os = "Windows";
  } else if (/Macintosh/i.test(ua)) {
    os = "MacOS";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  return { device, os };
};

const detectProvider = (
  user?: UserProfile
): "google" | "guest" | "unknown" => {
  if (!user?.email) return "unknown";
  const email = user.email.toLowerCase();
  if (
    email === "n/a" ||
    email.includes("guest") ||
    email.includes("anonymous") ||
    !email.includes("@")
  ) {
    return "guest";
  }
  return "google";
};

/**
 * Produces a privacy-safe analytics-safe user identifier.
 * Never sends raw email or name to Firebase Analytics.
 * Falls back to a session-based ID for guests.
 */
const getAnalyticsUserId = (
  userEmail: string,
  sessionId: string,
  authUid?: string | null
): string => {
  if (authUid) return authUid;
  if (!userEmail.startsWith("guest_"))
    return `u_${btoa(userEmail).slice(0, 16)}`;
  return `anon_${sessionId}`;
};


// ─── Core: logActivity ───────────────────────────────────────────────────────
export const logActivity = async (
  view: string,
  location: string,
  user?: UserProfile,
  action: string = "VIEW"
) => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  const { device, os } = getDeviceDetails();
  const provider = detectProvider(user);

  // Stable identifier — guests get a session-scoped email so they are tracked
  const userEmail =
    user?.email && user.email !== "N/A"
      ? user.email
      : `guest_${sessionId}`;

  const userName = user?.name || `Guest_${sessionId.substring(0, 6)}`;

  const newLog: ActivityLog = {
    id: generateUUID(),
    timestamp: Date.now(),
    view: sanitize(view),
    action: sanitize(action),
    location: sanitize(location),
    userAgent: navigator.userAgent.slice(0, MAX_STRING_LEN),
    userName: sanitize(userName),
    userEmail,
    sessionId,
    device,
    os,
    provider,
  };

  // ── Firebase Analytics (privacy-safe — no PII) ──
  if (analytics) {
    try {
      const analyticsUid = getAnalyticsUserId(
        userEmail,
        sessionId,
        auth.currentUser?.uid
      );

      setUserId(analytics, analyticsUid);

      setUserProperties(analytics, {
        device_type: device,
        operating_system: os,
        auth_provider: provider,
        // Do NOT send user_email or user_name — PII violation
      });

      logEvent(analytics, "activity_log", {
        view_name: sanitize(view),
        action_name: sanitize(action),
        device_type: device,
        operating_system: os,
        session_id: sessionId,
      });

      logEvent(analytics, "page_view", {
        page_title: sanitize(view),
        page_location: window.location.href,
        page_path: `/${sanitize(view, "").toLowerCase()}`,
      });
    } catch (err) {
      console.warn("[logActivity] Analytics error:", err);
    }
  }

  // ── Firestore write ──
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (authErr) {
      console.warn("[logActivity] Anonymous auth failed:", authErr);
    }
  }

  if (auth.currentUser) {
    try {
      const logDocRef = doc(db, "activityLogs", newLog.id);
      await setDoc(logDocRef, newLog);
    } catch (e) {
      console.warn("[logActivity] Firestore write failed:", e);
    }
  } else {
    console.debug("[logActivity] Firestore write skipped: User not authenticated.");
  }
};


// ─── Core: fetchLogsFromServer (paginated) ──────────────────────────────────
const fetchLogsFromServer = async (): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, "activityLogs"),
      orderBy("timestamp", "desc"),
      limit(MAX_LOG_RESULTS)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ActivityLog
    );
  } catch (e) {
    // Fallback: if orderBy fails (e.g. missing index), try unsorted
    try {
      const fallbackSnapshot = await getDocs(
        query(collection(db, "activityLogs"), limit(MAX_LOG_RESULTS))
      );
      return fallbackSnapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ActivityLog
      );
    } catch (e2) {
      console.error("Failed to fetch logs from firestore, fetching mock data instead.", e2);
      return [];
    }
  }
};


// ─── Core: getAnalyticsStats ────────────────────────────────────────────────
export const getAnalyticsStats = async () => {
  try {
    const logs = await fetchLogsFromServer();

    // Ensure descending order (safe even if Firestore returned unsorted)
    logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    const totalLogs = logs.length;
    const dailyActivity = logs.filter(
      (l) => l.timestamp >= startOfDay
    ).length;

    // ── Session Duration Map ──
    const sessionDurations = new Map<string, { start: number; end: number }>();

    logs.forEach((l) => {
      const sid = l.sessionId || `no_session_${l.userEmail}`;
      const existing = sessionDurations.get(sid);
      if (!existing) {
        sessionDurations.set(sid, { start: l.timestamp, end: l.timestamp });
      } else {
        existing.start = Math.min(existing.start, l.timestamp);
        existing.end = Math.max(existing.end, l.timestamp);
      }
    });

    // ── User Aggregation ──
    const userMap = new Map <
      string,
      {
        name: string;
        email: string;
        provider: string;
        firstSeen: number;
        lastSeen: number;
        lastLocation: string;
        sessions: Set<string>;
        locations: Set<string>;
        devices: Set<string>;
        osSet: Set<string>;
        logsCount: number;
      }
    > ();

    let activeUsersCount = 0;

    logs.forEach((log) => {
      if (!log.userEmail) return;

      const key = log.userEmail;

      if (!userMap.has(key)) {
        userMap.set(key, {
          name: log.userName || "Unknown",
          email: log.userEmail,
          provider: log.provider || "unknown",
          firstSeen: log.timestamp,
          lastSeen: log.timestamp,
          lastLocation: log.location || "Unknown",
          sessions: new Set<string>(),
          locations: new Set<string>(),
          devices: new Set<string>(),
          osSet: new Set<string>(),
          logsCount: 0,
        });
      }

      const u = userMap.get(key)!;

      // Update firstSeen / lastSeen
      u.firstSeen = Math.min(u.firstSeen, log.timestamp);
      u.lastSeen = Math.max(u.lastSeen, log.timestamp);

      // Update lastLocation only when this log is the most recent so far
      if (log.timestamp >= u.lastSeen) {
        u.lastLocation = log.location || "Unknown";
      }

      // Upgrade provider from unknown to a known value
      if (u.provider === "unknown" && log.provider && log.provider !== "unknown") {
        u.provider = log.provider;
      }

      if (log.sessionId) u.sessions.add(log.sessionId);
      if (log.location) u.locations.add(log.location);
      if (log.device) u.devices.add(log.device);
      if (log.os) u.osSet.add(log.os);
      u.logsCount++;
    });

    // ── Finalize Users ──
    const users = Array.from(userMap.values()).map((u) => {
      let totalTimeMs = 0;

      u.sessions.forEach((sid: string) => {
        const s = sessionDurations.get(sid);
        if (s) {
          let duration = s.end - s.start;
          if (duration <= 0) duration = MIN_SESSION_DURATION_MS;
          totalTimeMs += duration;
        }
      });

      const isActive = now - u.lastSeen < ACTIVE_THRESHOLD_MS;
      if (isActive) activeUsersCount++;

      return {
        name: u.name,
        email: u.email,
        provider: u.provider,
        firstSeen: u.firstSeen,
        lastSeen: u.lastSeen,
        lastLocation: u.lastLocation,
        sessionsCount: u.sessions.size,
        uniqueLocations: u.locations.size,
        deviceList: Array.from(u.devices),
        osList: Array.from(u.osSet),
        logsCount: u.logsCount,
        totalTimeFormatted: formatDuration(totalTimeMs),
        totalTimeMs,
        isActive,
        status: isActive ? "🟢 Online" : "⚫ Offline",
      };
    });

    // ── Provider Split ──
    const googleUsers = users.filter((u) => u.provider === "google").length;
    const guestUsers = users.filter((u) => u.provider === "guest").length;
    const unknownUsers = users.filter(
      (u) => u.provider === "unknown"
    ).length;

    // ── View Analytics ──
    const views: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.view) views[l.view] = (views[l.view] || 0) + 1;
    });

    // ── Average Session Time ──
    const totalSessionTime = Array.from(sessionDurations.values()).reduce(
      (acc, val) => acc + (val.end - val.start),
      0
    );
    const avgSessionTime =
      sessionDurations.size > 0
        ? formatDuration(totalSessionTime / sessionDurations.size)
        : "0s";

    return {
      overview: {
        totalLogs,
        totalUsers: users.length,
        utils: activeUsersCount,
        googleUsers,
        guestUsers,
        unknownUsers,
        dailyActivity,
        avgSessionTime,
        totalSessions: sessionDurations.size,
      },
      users: users.sort((a, b) => b.lastSeen - a.lastSeen),
      views,
      recentLogs: logs.slice(0, 100),  // Already sorted desc above
    };
  } catch (err) {
    console.error("Error in getAnalyticsStats:", err);
    return {
      overview: {
        totalLogs: 0,
        totalUsers: 0,
        utils: 0,
        googleUsers: 0,
        guestUsers: 0,
        unknownUsers: 0,
        dailyActivity: 0,
        avgSessionTime: "0s",
        totalSessions: 0,
      },
      users: [],
      views: {},
      recentLogs: [],
    };
  }
};


// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}