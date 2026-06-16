import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Sparkles, Leaf, TrendingUp, Droplets, ScanLine, Cpu, Satellite,
  CloudRain, Sprout, Shield, Activity, Lock, Wifi, Map
} from "lucide-react";

const DURATION = 2500;
const PARTICLE_COUNT = 50;
const DATA_STREAM_COUNT = 12;

const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

const generateParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.4 + 0.1,
    color: ["#10b981", "#34d399", "#22d3ee", "#a7f3d0"][Math.floor(Math.random() * 4)],
  }));

const generateDataStreams = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.15 + 0.05,
  }));

const BADGE_STYLES: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: { border: "border-cyan-500/40", bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]" },
  emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]" },
  amber: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-400", glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]" },
  blue: { border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]" },
  indigo: { border: "border-indigo-500/40", bg: "bg-indigo-500/10", text: "text-indigo-400", glow: "shadow-[0_0_20px_rgba(99,102,241,0.3)]" },
};

// Dust particle type
interface DustParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  born: number;
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [tractorPos, setTractorPos] = useState(-25); // percentage across screen
  const [exit, setExit] = useState(false);
  const [phase, setPhase] = useState(0);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);

  const raf = useRef<number>(0);
  const startTime = useRef<number>(0);
  const completedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dustCounter = useRef(0);

  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);
  const dataStreams = useMemo(() => generateDataStreams(DATA_STREAM_COUNT), []);

  // Neural Network Canvas
  const drawNeuralNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      nodes = Array.from({ length: 50 }, () => ({
        x: Math.random() * w,
        y: Math.random() * (h * 0.6),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }));
    };

    window.addEventListener("resize", resize);
    resize();

    let animFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h * 0.7) node.vy *= -1;

        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${Math.pow(1 - dist / 140, 2) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });

        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
        ctx.fill();
      });
      animFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  useEffect(() => {
    const phaseTimer = setTimeout(() => setPhase(1), 200);
    const cleanupCanvas = drawNeuralNetwork();

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setPhase(2);
      setTimeout(() => {
        setExit(true);
        setTimeout(onComplete, 600);
      }, 400);
    };

    // Failsafe timer to force transition if requestAnimationFrame gets throttled or fails
    const failsafe = setTimeout(() => {
      setProgress(100);
      finish();
    }, DURATION + 500);

    const animate = (t: number) => {
      if (!startTime.current) startTime.current = t;
      const elapsed = t - startTime.current;
      const p = Math.min(elapsed / DURATION, 1);
      const easedProgress = Math.round(easeOutExpo(p) * 100);
      setProgress(easedProgress);

      const tractorStart = 5;
      const tractorEnd = 95;
      const tractorRange = tractorEnd - tractorStart;
      const tractorProgress = Math.max(0, Math.min(1, (easedProgress - tractorStart) / tractorRange));
      const tractorEased = tractorProgress < 0.5
        ? 2 * tractorProgress * tractorProgress
        : 1 - Math.pow(-2 * tractorProgress + 2, 2) / 2;
      const newTractorPos = -20 + tractorEased * 120;
      setTractorPos(newTractorPos);

      // Spawn dust particles
      if (tractorProgress > 0.05 && tractorProgress < 0.95 && Math.random() > 0.5) {
        dustCounter.current += 1;
        setDustParticles(prev => [
          ...prev.filter(dp => Date.now() - dp.born < 1500).slice(-15),
          {
            id: dustCounter.current,
            x: newTractorPos - 2 + Math.random() * 4,
            y: 70 + Math.random() * 20,
            opacity: 0.6 + Math.random() * 0.4,
            size: 3 + Math.random() * 6,
            born: Date.now(),
          },
        ]);
      }

      if (p < 1) raf.current = requestAnimationFrame(animate);
      else setTimeout(finish, 200);
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(failsafe);
      cancelAnimationFrame(raf.current);
      cleanupCanvas?.();
    };
  }, [onComplete, drawNeuralNetwork]);

  // Text reveal percentage synced with tractor
  const textRevealPercent = useMemo(() => {
    return Math.min(100, Math.max(0, (tractorPos + 20) / 1.2));
  }, [tractorPos]);

  const status = useMemo(() => {
    if (progress < 12) return { text: "INITIALIZING AI CORE", color: "text-emerald-400", icon: Activity };
    if (progress < 25) return { text: "LINKING AUTONOMOUS FLEET", color: "text-cyan-400", icon: Cpu };
    if (progress < 40) return { text: "SCANNING TERRAIN MAP", color: "text-blue-400", icon: Map };
    if (progress < 55) return { text: "SYNCING WEATHER SATELLITE", color: "text-amber-400", icon: CloudRain };
    if (progress < 70) return { text: "CALIBRATING BIO-SENSORS", color: "text-green-400", icon: ScanLine };
    if (progress < 88) return { text: "OPTIMIZING CROP YIELD AI", color: "text-indigo-400", icon: TrendingUp };
    return { text: "ALL SYSTEMS OPERATIONAL", color: "text-white", icon: Shield };
  }, [progress]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          exit ? "opacity-0 scale-110 blur-2xl flex-none" : "opacity-100 scale-100 blur-0"
        }`}
        style={{ background: "#020805" }}
      >
        {/* === BACKGROUND LAYERS === */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#064e3b_0%,#021a0f_45%,#020805_100%)]" />

        {/* Data Streams */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {dataStreams.map(ds => (
            <div
              key={ds.id}
              className="absolute top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent animate-data-stream"
              style={{ left: `${ds.left}%`, animationDuration: `${ds.duration}s`, animationDelay: `${ds.delay}s`, opacity: ds.opacity }}
            />
          ))}
        </div>

        {/* Neural Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen mask-sky" />

        {/* Ground Grid */}
        <div className="absolute bottom-0 left-0 w-full h-[45vh] md:h-[50vh] grid-container opacity-30">
          <div className="perspective-grid" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent shadow-[0_0_25px_#10b981,0_0_50px_#10b981]" />
        </div>

        {/* Bio Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full particle-float will-change-transform"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              backgroundColor: p.color, opacity: p.opacity,
              animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
            }}
          />
        ))}

        {/* HUD Corners */}
        <div className="absolute inset-0 pointer-events-none p-3 md:p-8 z-10">
          <div className="absolute top-3 left-3 md:top-8 md:left-8 flex flex-col gap-1 opacity-50">
            <div className="flex items-center gap-1.5">
              <Wifi size={10} className="text-emerald-400 animate-pulse" />
              <span className="text-[7px] md:text-[9px] font-mono text-emerald-400 tracking-[0.3em] uppercase">Fleet_Online</span>
            </div>
            <div className="w-16 md:w-28 h-[1px] bg-emerald-500/40" />
          </div>
          <div className="absolute bottom-3 right-3 md:bottom-8 md:right-8 flex flex-col items-end gap-1 opacity-50">
            <span className="text-[7px] md:text-[9px] font-mono text-cyan-400 tracking-[0.3em] uppercase">Sensor_Grid</span>
            <div className="w-16 md:w-28 h-[1px] bg-cyan-500/40" />
          </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div className="relative w-full flex flex-col items-center z-20 px-4">

          {/* Top Badge */}
          <div className={`transition-all duration-1000 ease-out mb-4 md:mb-6 ${phase >= 1 ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
            <div className="flex items-center gap-2.5 px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-emerald-500/30 bg-black/50 backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[8px] md:text-[11px] font-mono font-bold tracking-[0.3em] md:tracking-[0.5em] text-emerald-300 uppercase">aikrushimitra.in</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
          </div>

          {/* === HERO ZONE: Text + Tractor Scene === */}
          <div className="relative w-full max-w-[95vw] md:max-w-[900px] h-[140px] sm:h-[180px] md:h-[280px] lg:h-[320px] flex items-center justify-center mb-2 md:mb-4">

            {/* Ghost Text (always visible, dim) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
              <div className="w-full">
                <svg viewBox="0 0 800 300" className="w-full h-auto">
                  <defs>
                    <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>
                  <text x="50%" y="38%" textAnchor="middle" dominantBaseline="middle"
                    fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="160"
                    fill="none" stroke="url(#ghostGrad)" strokeWidth="3" letterSpacing="-0.03em">
                    KRUSHI
                  </text>
                  <text x="50%" y="78%" textAnchor="middle" dominantBaseline="middle"
                    fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="160"
                    fill="none" stroke="url(#ghostGrad)" strokeWidth="3" letterSpacing="-0.03em">
                    MITRA
                  </text>
                </svg>
              </div>
            </div>

            {/* Revealed Text (clipped by tractor position) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 select-none"
              style={{ clipPath: `inset(0 ${100 - textRevealPercent}% 0 0)` }}
            >
              <div className="w-full">
                <svg viewBox="0 0 800 300" className="w-full h-auto">
                  <defs>
                    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#ecfdf5" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                    <linearGradient id="brandGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <filter id="textGlow">
                      <feGaussianBlur stdDeviation="6" result="b1" />
                      <feGaussianBlur stdDeviation="12" result="b2" />
                      <feMerge>
                        <feMergeNode in="b2" />
                        <feMergeNode in="b1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Glow Layer */}
                  <g filter="url(#textGlow)">
                    <text x="50%" y="38%" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="160"
                      fill="none" stroke="url(#brandGlow)" strokeWidth="6" letterSpacing="-0.03em">
                      KRUSHI
                    </text>
                    <text x="50%" y="78%" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="160"
                      fill="none" stroke="url(#brandGlow)" strokeWidth="6" letterSpacing="-0.03em">
                      MITRA
                    </text>
                  </g>
                  {/* Crisp White Fill */}
                  <text x="50%" y="38%" textAnchor="middle" dominantBaseline="middle"
                    fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="160"
                    fill="url(#brandGrad)" letterSpacing="-0.03em">
                    KRUSHI
                  </text>
                  <text x="50%" y="78%" textAnchor="middle" dominantBaseline="middle"
                    fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="160"
                    fill="url(#brandGrad)" letterSpacing="-0.03em">
                    MITRA
                  </text>
                </svg>
              </div>
            </div>

            {/* === THE TRACTOR (z-20 — behind text z-30) === */}
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                left: `${tractorPos}%`,
                bottom: '5%',
                width: 'clamp(120px, 30vw, 300px)',
                transition: 'left 0.1s linear',
              }}
            >
              <div className="tractor-bounce relative">
                {/* Ground glow under tractor */}
                <div className="absolute bottom-[-5px] left-[5%] w-[90%] h-[15px] bg-emerald-400/50 rounded-[100%] blur-lg" />

                <svg viewBox="0 0 420 240" className="w-full h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
                  <defs>
                    <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#047857" />
                      <stop offset="100%" stopColor="#022c22" />
                    </linearGradient>
                    <linearGradient id="gGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
                      <stop offset="100%" stopColor="rgba(34,211,238,0.1)" />
                    </linearGradient>
                    <linearGradient id="tGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1f2937" />
                      <stop offset="100%" stopColor="#0a0a0a" />
                    </linearGradient>
                    <filter id="ng" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Headlight Beam (right side — driving direction) */}
                  <polygon points="380,125 460,85 460,165" fill="url(#gGrad)" opacity="0.35" className="headlight-flicker" />

                  {/* Laser Scanner */}
                  <g className="laser-beam">
                    <polygon points="360,140 395,230 325,230" fill="url(#gGrad)" opacity="0.5" />
                    <line x1="360" y1="140" x2="360" y2="230" stroke="#22d3ee" strokeWidth="2.5" filter="url(#ng)" />
                    <ellipse cx="360" cy="230" rx="35" ry="6" fill="#22d3ee" opacity="0.7" filter="url(#ng)" />
                  </g>

                  {/* Back hitch */}
                  <rect x="30" y="140" width="50" height="20" rx="3" fill="#065f46" />
                  <circle cx="35" cy="150" r="9" fill="#10b981" filter="url(#ng)" />

                  {/* Chassis */}
                  <path d="M80 100 L125 65 L230 65 L270 100 L375 112 L385 170 L75 170Z" fill="url(#cGrad)" stroke="#34d399" strokeWidth="2" />

                  {/* Armor details */}
                  <path d="M270 100 L360 112 L348 135 L260 122Z" fill="#047857" opacity="0.8" />
                  <path d="M95 112 L155 112 L145 145 L85 145Z" fill="#022c22" stroke="#10b981" strokeWidth="1" />

                  {/* Cabin / AI Dome */}
                  <path d="M145 65 L175 25 L250 25 L270 65Z" fill="url(#gGrad)" stroke="#22d3ee" strokeWidth="2.5" filter="url(#ng)" />

                  {/* AI Core inside cabin */}
                  <circle cx="210" cy="48" r="12" fill="#ffffff" filter="url(#ng)" className="animate-pulse" />
                  <circle cx="210" cy="48" r="20" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 3" className="cabin-ring" />

                  {/* Headlight block */}
                  <rect x="370" y="115" width="18" height="22" rx="3" fill="#ffffff" opacity="0.9" />

                  {/* Exhaust pipe */}
                  <rect x="130" y="20" width="8" height="45" rx="4" fill="#374151" />
                  <circle cx="134" cy="18" r="6" fill="#1f2937" />
                  {/* Exhaust puff */}
                  <g className="exhaust-puff">
                    <circle cx="134" cy="8" r="4" fill="#6b7280" opacity="0.3" />
                    <circle cx="128" cy="2" r="3" fill="#6b7280" opacity="0.2" />
                  </g>

                  {/* === REAR BIG WHEEL === */}
                  <g className="wheel-spin-anim" style={{ transformOrigin: '140px 155px' }}>
                    <circle cx="140" cy="155" r="58" fill="url(#tGrad)" stroke="#374151" strokeWidth="5" />
                    {[...Array(14)].map((_, i) => (
                      <rect key={`rt${i}`} x="136" y="92" width="8" height="12" rx="1" fill="#111827"
                        transform={`rotate(${i * (360 / 14)} 140 155)`} />
                    ))}
                    <circle cx="140" cy="155" r="38" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
                    <circle cx="140" cy="155" r="20" fill="#022c22" />
                    <circle cx="140" cy="155" r="9" fill="#10b981" filter="url(#ng)" />
                    {[...Array(6)].map((_, i) => (
                      <line key={`rs${i}`} x1="140" y1="155" x2="140" y2="117" stroke="#10b981" strokeWidth="3"
                        transform={`rotate(${i * 60} 140 155)`} opacity="0.6" />
                    ))}
                  </g>

                  {/* === FRONT SMALL WHEEL === */}
                  <g className="wheel-spin-anim" style={{ transformOrigin: '310px 170px' }}>
                    <circle cx="310" cy="170" r="38" fill="url(#tGrad)" stroke="#374151" strokeWidth="4" />
                    {[...Array(10)].map((_, i) => (
                      <rect key={`ft${i}`} x="307" y="129" width="6" height="9" rx="1" fill="#111827"
                        transform={`rotate(${i * 36} 310 170)`} />
                    ))}
                    <circle cx="310" cy="170" r="22" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                    <circle cx="310" cy="170" r="7" fill="#10b981" filter="url(#ng)" />
                    {[...Array(5)].map((_, i) => (
                      <line key={`fs${i}`} x1="310" y1="170" x2="310" y2="150" stroke="#10b981" strokeWidth="2"
                        transform={`rotate(${i * 72} 310 170)`} opacity="0.6" />
                    ))}
                  </g>
                </svg>
              </div>
            </div>

            {/* Dust Trail Particles */}
            {dustParticles.map(dp => {
              const age = (Date.now() - dp.born) / 1500;
              if (age > 1) return null;
              return (
                <div
                  key={dp.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${dp.x}%`,
                    bottom: `${dp.y - age * 15}%`,
                    width: `${dp.size + age * 8}px`,
                    height: `${dp.size + age * 8}px`,
                    backgroundColor: '#a7f3d0',
                    opacity: dp.opacity * (1 - age),
                    filter: `blur(${age * 4}px)`,
                    transition: 'all 0.15s linear',
                  }}
                />
              );
            })}
          </div>

          {/* Tagline */}
          <div className={`flex items-center gap-2 sm:gap-4 mb-6 md:mb-8 transition-all duration-1000 delay-700 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <div className="h-[1px] w-8 sm:w-16 md:w-28 bg-gradient-to-r from-transparent to-emerald-400/60" />
            <div className="flex items-center gap-2 bg-black/60 px-3 md:px-5 py-1.5 rounded-full border border-emerald-500/25 backdrop-blur-md">
              <Sparkles size={12} className="text-emerald-400 animate-pulse flex-shrink-0" />
              <p className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.4em] text-emerald-100/90 uppercase font-mono whitespace-nowrap">
                Autonomous Farm Guardian
              </p>
              <Sparkles size={12} className="text-emerald-400 animate-pulse flex-shrink-0" />
            </div>
            <div className="h-[1px] w-8 sm:w-16 md:w-28 bg-gradient-to-l from-transparent to-emerald-400/60" />
          </div>

          {/* Feature Badges */}
          <div className={`flex flex-wrap justify-center gap-2.5 sm:gap-3 md:gap-6 mb-8 md:mb-10 transition-all duration-1000 ease-out ${
            phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}>
            <HoloBadge icon={Satellite} label="SAT-SYNC" color="cyan" delay={0} />
            <HoloBadge icon={Leaf} label="BIO-YIELD" color="emerald" delay={100} />
            <HoloBadge icon={Map} label="TERRAIN" color="amber" delay={200} />
            <HoloBadge icon={Droplets} label="AQUA-NET" color="blue" delay={300} />
            <HoloBadge icon={Cpu} label="AI-CORE" color="indigo" delay={400} />
          </div>

          {/* Progress Bar */}
          <div className={`w-full max-w-xl md:max-w-2xl transition-all duration-1000 ease-out ${
            phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className={`flex items-center gap-2 ${status.color} transition-colors duration-300 text-[9px] md:text-[11px] font-mono font-bold tracking-[0.15em]`}>
                <status.icon size={14} className={`${progress < 100 ? 'animate-spin-slow' : 'animate-pulse'} flex-shrink-0`} />
                <span className="drop-shadow-[0_0_6px_currentColor] truncate">{status.text}</span>
              </div>
              <span className="text-white font-mono font-black text-sm md:text-base tabular-nums tracking-widest ml-2">{progress}%</span>
            </div>

            <div className="relative h-2 md:h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-emerald-900/40 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] p-[1.5px]">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-emerald-600 via-cyan-400 to-emerald-400 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-progress-stripes" />
              </div>
            </div>

            <div className="flex justify-between mt-2.5 text-[8px] md:text-[9px] font-mono text-emerald-500/50 tracking-[0.2em] px-1">
              <span>KRUSHI_OS_V5</span>
              <span className="flex items-center gap-1.5">
                <Lock size={8} />
                ENCRYPTED
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .particle-float { animation: particleRise linear infinite; pointer-events: none; }
        @keyframes particleRise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateY(-100vh) scale(0.4); opacity: 0; }
        }

        .animate-data-stream { animation: dataStream linear infinite; }
        @keyframes dataStream { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }

        .grid-container { perspective: 900px; overflow: hidden; mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%); }
        .perspective-grid {
          position: absolute; bottom: -60%; left: -50%; width: 200%; height: 180%;
          background-image: linear-gradient(rgba(16,185,129,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.18) 1px, transparent 1px);
          background-size: 70px 70px;
          transform: rotateX(72deg) translateY(0);
          animation: gridDrive 2.5s linear infinite;
        }
        @keyframes gridDrive { 0% { transform: rotateX(72deg) translateY(0); } 100% { transform: rotateX(72deg) translateY(70px); } }
        .mask-sky { mask-image: linear-gradient(to bottom, black 35%, transparent 85%); }

        /* Tractor bounce */
        .tractor-bounce { animation: tractorBump 0.6s ease-in-out infinite alternate; }
        @keyframes tractorBump {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-2px) rotate(0.4deg); }
        }

        /* Wheels */
        .wheel-spin-anim { animation: wheelSpin 0.8s linear infinite; }
        @keyframes wheelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .cabin-ring { animation: cabinSpin 6s linear infinite; transform-origin: 210px 48px; }
        @keyframes cabinSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Laser */
        .laser-beam { animation: laserSweep 1.8s ease-in-out infinite alternate; transform-origin: 360px 140px; }
        @keyframes laserSweep { 0% { transform: scaleX(0.85) skewX(-12deg); opacity: 0.4; } 100% { transform: scaleX(1.15) skewX(12deg); opacity: 0.8; } }

        /* Headlight */
        .headlight-flicker { animation: flicker 2.5s infinite; }
        @keyframes flicker { 0%,100% { opacity: 0.35; } 50% { opacity: 0.6; } 52% { opacity: 0.15; } 54% { opacity: 0.5; } }

        /* Exhaust */
        .exhaust-puff { animation: exhaustPuff 2s ease-out infinite; }
        @keyframes exhaustPuff {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-20px) scale(2); opacity: 0; }
        }

        /* Utils */
        .animate-progress-stripes { animation: progressStripes 0.8s linear infinite; }
        @keyframes progressStripes { from { background-position: 0 0; } to { background-position: 16px 0; } }
        .animate-spin-slow { animation: spinSlow 3s linear infinite; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </>
  );
}

const HoloBadge = React.memo(({ icon: Icon, label, color, delay }: { icon: any; label: string; color: string; delay: number }) => {
  const s = BADGE_STYLES[color];
  return (
    <div className="animate-float" style={{ animationDelay: `${delay}ms` }}>
      <div className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-[68px] sm:h-[68px] md:w-24 md:h-24 rounded-xl md:rounded-2xl border bg-black/60 backdrop-blur-xl ${s.border} ${s.glow} transition-all duration-500 hover:scale-110 group cursor-pointer overflow-hidden`}>
        <Icon size={18} strokeWidth={1.5} className={`${s.text} mb-1 md:mb-1.5 relative z-10 drop-shadow-[0_0_6px_currentColor] w-4 h-4 md:w-6 md:h-6`} />
        <span className={`text-[6px] md:text-[8px] font-mono font-bold tracking-wider ${s.text} opacity-90 uppercase relative z-10`}>{label}</span>
        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${s.border} rounded-tl-lg`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${s.border} rounded-br-lg`} />
      </div>
    </div>
  );
});
HoloBadge.displayName = "HoloBadge";