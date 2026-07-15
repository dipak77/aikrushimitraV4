import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import logger from './logger.js';

// Default prompts from apps/web/utils/prompts.js
import { 
  AGRI_EXPERT_V1, 
  DISEASE_DIAGNOSIS_V1, 
  WEATHER_ADVISORY_V1, 
  MARKET_ANALYSIS_V1, 
  SCHEME_MATCHER_V1, 
  SOIL_INTERPRETER_V1 
} from '../../apps/web/utils/prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data_store');
const CONFIG_FILE = path.join(DATA_DIR, 'platform_config.json');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Symmetric encryption key setup
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'ai-krushi-mitra-secret-key-32-bytes';
// Must be exactly 32 bytes for aes-256-cbc
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    logger.warn('Failed to decrypt secret, returning as-is: ' + err.message);
    return text;
  }
}

// Initial default configuration
const DEFAULT_CONFIG = {
  profile: 'Development',
  ai: {
    defaultProvider: 'gemini',
    defaultModel: 'gemini-2.5-flash',
    reasoningLevel: 'Medium',
    temperature: 0.4,
    maxTokens: 8192,
    providers: {
      gemini: { enabled: true, apiKey: process.env.GEMINI_API_KEY || '', model: 'gemini-2.5-flash', maxTokens: 8192, temperature: 0.4 },
      openai: { enabled: false, apiKey: '', model: 'gpt-4o-mini', maxTokens: 4096, temperature: 0.7 },
      claude: { enabled: false, apiKey: '', model: 'claude-3-5-sonnet', maxTokens: 4096, temperature: 0.7 },
      openrouter: { enabled: false, apiKey: '', model: 'meta-llama/llama-3.1-8b-instruct', maxTokens: 4096, temperature: 0.7 },
      glm: { enabled: false, apiKey: '', model: 'glm-4', maxTokens: 4096, temperature: 0.7 },
      groq: { enabled: false, apiKey: '', model: 'llama3-8b-8192', maxTokens: 8192, temperature: 0.7 },
      deepseek: { enabled: false, apiKey: '', model: 'deepseek-chat', maxTokens: 8192, temperature: 0.5 },
      mistral: { enabled: false, apiKey: '', model: 'mistral-large-latest', maxTokens: 4096, temperature: 0.7 },
      ollama: { enabled: false, apiKey: '', model: 'llama3', maxTokens: 2048, temperature: 0.7 },
      local: { enabled: false, apiKey: '', model: 'local-model', maxTokens: 2048, temperature: 0.7 }
    }
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  },
  externalApis: {
    weather: { provider: 'open-meteo', apiKey: '' },
    maps: { provider: 'google-maps', apiKey: '' },
    sms: { provider: 'twilio', accountSid: '', authToken: '' },
    email: { provider: 'smtp', host: '', port: 587, user: '', password: '' },
    payments: { provider: 'razorpay', keyId: '', keySecret: '' }
  },
  features: {
    aiAssistant: true,
    cropDiagnosis: true,
    weather: true,
    marketplace: true,
    govtSchemes: true,
    offlineMode: true,
    voiceAssistant: true
  },
  prompts: {
    diseaseDiagnosis: { version: '1.0', content: DISEASE_DIAGNOSIS_V1, history: [] },
    weatherAdvisory: { version: '1.0', content: WEATHER_ADVISORY_V1, history: [] },
    schemeMatcher: { version: '1.0', content: SCHEME_MATCHER_V1, history: [] },
    soilInterpreter: { version: '1.0', content: SOIL_INTERPRETER_V1, history: [] },
    agriExpert: { version: '1.0', content: AGRI_EXPERT_V1, history: [] }
  },
  menuSettings: {
    sequence: [
      'DASHBOARD',
      'LANDING',
      'WEATHER',
      'CALENDAR',
      'SABJI_MANDI',
      'CHAT',
      'AGRI_KNOWLEDGE',
      'SCHEMES',
      'MARKET',
      'COMMUNITY',
      'DISEASE_DETECTOR',
      'SOIL',
      'YIELD',
      'AREA_CALCULATOR',
      'PREMIUM',
      'INNOVATION',
      'ADMIN',
      'SETTINGS'
    ],
    visibility: {
      DASHBOARD: true,
      LANDING: true,
      WEATHER: true,
      CALENDAR: true,
      SABJI_MANDI: true,
      CHAT: true,
      AGRI_KNOWLEDGE: true,
      SCHEMES: true,
      MARKET: true,
      COMMUNITY: true,
      DISEASE_DETECTOR: true,
      SOIL: true,
      YIELD: true,
      AREA_CALCULATOR: true,
      PREMIUM: true,
      INNOVATION: true,
      ADMIN: true,
      SETTINGS: true
    }
  }
};

let cacheConfig = null;

// Read config from disk and decrypt secrets
export function loadConfig() {
  if (cacheConfig) return cacheConfig;

  let rawData = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      rawData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      logger.error('Failed to parse config file, falling back to defaults: ' + e.message);
    }
  }

  // Deep merge default config and rawData
  const merged = mergeDeep(DEFAULT_CONFIG, rawData);

  // Decrypt secrets in loaded configuration
  decryptSecrets(merged);

  cacheConfig = merged;
  return merged;
}

function mergeDeep(target, source) {
  const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
  if (!isObject(target) || !isObject(source)) return source;

  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (isObject(target[key]) && isObject(source[key])) {
      output[key] = mergeDeep(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

function decryptSecrets(config) {
  // Decrypt AI Provider keys
  if (config.ai && config.ai.providers) {
    Object.keys(config.ai.providers).forEach(key => {
      const provider = config.ai.providers[key];
      if (provider.apiKey) provider.apiKey = decrypt(provider.apiKey);
    });
  }
  // Decrypt dynamic firebase key
  if (config.firebase && config.firebase.apiKey) {
    config.firebase.apiKey = decrypt(config.firebase.apiKey);
  }
  // Decrypt external API keys
  if (config.externalApis) {
    if (config.externalApis.weather?.apiKey) config.externalApis.weather.apiKey = decrypt(config.externalApis.weather.apiKey);
    if (config.externalApis.maps?.apiKey) config.externalApis.maps.apiKey = decrypt(config.externalApis.maps.apiKey);
    if (config.externalApis.sms?.authToken) config.externalApis.sms.authToken = decrypt(config.externalApis.sms.authToken);
    if (config.externalApis.email?.password) config.externalApis.email.password = decrypt(config.externalApis.email.password);
    if (config.externalApis.payments?.keySecret) config.externalApis.payments.keySecret = decrypt(config.externalApis.payments.keySecret);
  }
}

function encryptSecrets(config) {
  const cloned = JSON.parse(JSON.stringify(config));
  // Encrypt AI keys
  if (cloned.ai && cloned.ai.providers) {
    Object.keys(cloned.ai.providers).forEach(key => {
      const provider = cloned.ai.providers[key];
      if (provider.apiKey) provider.apiKey = encrypt(provider.apiKey);
    });
  }
  // Encrypt dynamic firebase key
  if (cloned.firebase && cloned.firebase.apiKey) {
    cloned.firebase.apiKey = encrypt(cloned.firebase.apiKey);
  }
  // Encrypt external API keys
  if (cloned.externalApis) {
    if (cloned.externalApis.weather?.apiKey) cloned.externalApis.weather.apiKey = encrypt(cloned.externalApis.weather.apiKey);
    if (cloned.externalApis.maps?.apiKey) cloned.externalApis.maps.apiKey = encrypt(cloned.externalApis.maps.apiKey);
    if (cloned.externalApis.sms?.authToken) cloned.externalApis.sms.authToken = encrypt(cloned.externalApis.sms.authToken);
    if (cloned.externalApis.email?.password) cloned.externalApis.email.password = encrypt(cloned.externalApis.email.password);
    if (cloned.externalApis.payments?.keySecret) cloned.externalApis.payments.keySecret = encrypt(cloned.externalApis.payments.keySecret);
  }
  return cloned;
}

// Mask sensitive values for client transmission
export function maskSecrets(config) {
  const masked = JSON.parse(JSON.stringify(config));
  const mask = key => {
    if (!key || typeof key !== 'string') return '';
    if (key.length <= 4) return '****';
    return '********' + key.slice(-4);
  };

  if (masked.ai && masked.ai.providers) {
    Object.keys(masked.ai.providers).forEach(key => {
      const provider = masked.ai.providers[key];
      if (provider.apiKey) provider.apiKey = mask(provider.apiKey);
    });
  }
  if (masked.firebase && masked.firebase.apiKey) {
    masked.firebase.apiKey = mask(masked.firebase.apiKey);
  }
  if (masked.externalApis) {
    if (masked.externalApis.weather?.apiKey) masked.externalApis.weather.apiKey = mask(masked.externalApis.weather.apiKey);
    if (masked.externalApis.maps?.apiKey) masked.externalApis.maps.apiKey = mask(masked.externalApis.maps.apiKey);
    if (masked.externalApis.sms?.authToken) masked.externalApis.sms.authToken = mask(masked.externalApis.sms.authToken);
    if (masked.externalApis.email?.password) masked.externalApis.email.password = mask(masked.externalApis.email.password);
    if (masked.externalApis.payments?.keySecret) masked.externalApis.payments.keySecret = mask(masked.externalApis.payments.keySecret);
  }
  return masked;
}

// Save config to disk and update audit log
export function saveConfig(newConfig, actor = 'System') {
  const currentConfig = loadConfig();

  // Diff the settings to construct the audit log entries
  const changes = [];
  
  // Track profile changes
  if (newConfig.profile !== currentConfig.profile) {
    changes.push({ field: 'profile', oldValue: currentConfig.profile, newValue: newConfig.profile });
  }

  // Track provider API key changes
  if (newConfig.ai?.providers && currentConfig.ai?.providers) {
    Object.keys(newConfig.ai.providers).forEach(key => {
      const oldKey = currentConfig.ai.providers[key]?.apiKey || '';
      const newKey = newConfig.ai.providers[key]?.apiKey || '';
      if (newKey && newKey !== oldKey && !newKey.startsWith('****')) {
        changes.push({ field: `ai.providers.${key}.apiKey`, oldValue: '********' + oldKey.slice(-4), newValue: '********' + newKey.slice(-4) });
      }
    });
  }

  // Track feature flag changes
  if (newConfig.features && currentConfig.features) {
    Object.keys(newConfig.features).forEach(key => {
      const oldVal = currentConfig.features[key];
      const newVal = newConfig.features[key];
      if (newVal !== oldVal) {
        changes.push({ field: `features.${key}`, oldValue: String(oldVal), newValue: String(newVal) });
      }
    });
  }

  // Track menuSettings changes
  if (newConfig.menuSettings && currentConfig.menuSettings) {
    if (JSON.stringify(newConfig.menuSettings) !== JSON.stringify(currentConfig.menuSettings)) {
      changes.push({ field: 'menuSettings', oldValue: 'custom order/visibility', newValue: 'updated order/visibility' });
    }
  }

  // Track prompt changes
  if (newConfig.prompts && currentConfig.prompts) {
    Object.keys(newConfig.prompts).forEach(key => {
      const oldPrompt = currentConfig.prompts[key];
      const newPrompt = newConfig.prompts[key];
      if (newPrompt.content !== oldPrompt.content) {
        // Record prompt history for rollback
        newPrompt.history = oldPrompt.history || [];
        newPrompt.history.push({
          version: oldPrompt.version || '1.0',
          content: oldPrompt.content,
          timestamp: Date.now(),
          actor
        });
        
        // Auto increment version
        const parts = (oldPrompt.version || '1.0').split('.');
        const nextPatch = parseInt(parts[parts.length - 1], 10) + 1;
        newPrompt.version = parts.slice(0, -1).concat(nextPatch).join('.');
        
        changes.push({ field: `prompts.${key}.content`, oldValue: `v${oldPrompt.version}`, newValue: `v${newPrompt.version}` });
      }
    });
  }

  // Merge updates and encrypt before saving
  cacheConfig = { ...currentConfig, ...newConfig };
  
  const encrypted = encryptSecrets(cacheConfig);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(encrypted, null, 2), 'utf8');

  // Log changes to audit logs
  if (changes.length > 0) {
    addAuditLog(actor, 'Updated Settings', changes);
  }

  logger.info(`💾 Platform configuration saved by ${actor}`);
  return cacheConfig;
}

// Audit Logs Manager
export function loadAuditLogs() {
  if (fs.existsSync(AUDIT_LOG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function addAuditLog(actor, action, details) {
  const logs = loadAuditLogs();
  const newLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    actor,
    action,
    details
  };
  logs.unshift(newLog); // Prepend so latest is first
  
  // Cap logs at 1000 items
  fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(logs.slice(0, 1000), null, 2), 'utf8');
}
