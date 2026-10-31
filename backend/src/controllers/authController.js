import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../database/supabaseClient.js';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const PROFILES_FILE = path.join(DATA_DIR, 'local_profiles.json');
const PREFS_FILE = path.join(DATA_DIR, 'local_preferences.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('[Auth] Could not create data directory:', e.message);
  }
}

// In-memory fallback stores with disk persistence
const localProfiles = new Map();
const localPreferences = new Map();

// Helper to save profiles to disk
function saveProfilesToDisk() {
  try {
    const list = Array.from(localProfiles.values());
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Auth] Failed to persist profiles to disk:', err.message);
  }
}

// Helper to save preferences to disk
function savePreferencesToDisk() {
  try {
    const obj = Object.fromEntries(localPreferences);
    fs.writeFileSync(PREFS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Auth] Failed to persist preferences to disk:', err.message);
  }
}

// Initialize seed demo accounts & load from disk
function initLocalAuth() {
  // Pre-seed demo users
  const demoHash = bcrypt.hashSync('demo123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  localProfiles.set('demo@linguamate.ai', {
    id: 'user-demo-001',
    email: 'demo@linguamate.ai',
    passwordHash: demoHash,
    full_name: 'Demo User',
    role: 'user',
    preferred_language: 'en',
    created_at: new Date().toISOString(),
  });

  localProfiles.set('admin@linguamate.ai', {
    id: 'user-admin-001',
    email: 'admin@linguamate.ai',
    passwordHash: adminHash,
    full_name: 'System Administrator',
    role: 'admin',
    preferred_language: 'en',
    created_at: new Date().toISOString(),
  });

  // Load any previously saved users from disk
  if (fs.existsSync(PROFILES_FILE)) {
    try {
      const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const u of list) {
          if (u.email) {
            localProfiles.set(u.email.toLowerCase().trim(), u);
          }
        }
      }
    } catch (e) {
      console.warn('[Auth] Could not load profiles file:', e.message);
    }
  }

  // Load preferences
  if (fs.existsSync(PREFS_FILE)) {
    try {
      const raw = fs.readFileSync(PREFS_FILE, 'utf-8');
      const prefs = JSON.parse(raw);
      for (const [k, v] of Object.entries(prefs)) {
        localPreferences.set(k, v);
      }
    } catch (e) {
      console.warn('[Auth] Could not load preferences file:', e.message);
    }
  }

  // Save initial seed to disk
  saveProfilesToDisk();
}

initLocalAuth();

export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, preferredLanguage, role } = req.body;
    let normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail.includes('@')) {
      normalizedEmail = `${normalizedEmail}@linguamate.ai`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (supabase) {
      try {
        let targetTable = 'profiles';
        let { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (checkError && checkError.code === 'PGRST205') {
          targetTable = 'users';
          const { data: existingUser2 } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();
          existingUser = existingUser2;
        }

        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists. Please log in.',
          });
        }

        if (targetTable === 'profiles') {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              email: normalizedEmail,
              password_hash: passwordHash,
              full_name: fullName || normalizedEmail.split('@')[0],
              preferred_language: preferredLanguage || 'en',
              role: role || 'user',
            })
            .select()
            .single();

          if (profileError) throw profileError;

          await supabase.from('user_preferences').insert({
            user_id: newProfile.id,
            target_language: preferredLanguage || 'en',
          }).catch(() => {});

          // Mirror into local cache
          localProfiles.set(normalizedEmail, {
            id: newProfile.id,
            email: newProfile.email,
            passwordHash,
            full_name: newProfile.full_name,
            role: newProfile.role,
            preferred_language: newProfile.preferred_language,
            created_at: newProfile.created_at || new Date().toISOString(),
          });
          saveProfilesToDisk();

          const token = jwt.sign(
            {
              id: newProfile.id,
              email: newProfile.email,
              role: newProfile.role,
              fullName: newProfile.full_name,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn || '7d' }
          );

          return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
              id: newProfile.id,
              email: newProfile.email,
              fullName: newProfile.full_name,
              full_name: newProfile.full_name,
              role: newProfile.role,
              preferredLanguage: newProfile.preferred_language,
            },
          });
        } else {
          const { data: newUser, error: uError } = await supabase
            .from('users')
            .insert({
              email: normalizedEmail,
              password_hash: passwordHash,
              name: fullName || normalizedEmail.split('@')[0],
              preferred_language: preferredLanguage || 'en',
              role: role || 'user',
            })
            .select()
            .single();

          if (uError) throw uError;

          localProfiles.set(normalizedEmail, {
            id: newUser.id,
            email: newUser.email,
            passwordHash,
            full_name: newUser.name,
            role: newUser.role,
            preferred_language: newUser.preferred_language,
            created_at: newUser.created_at || new Date().toISOString(),
          });
          saveProfilesToDisk();

          const token = jwt.sign(
            {
              id: newUser.id,
              email: newUser.email,
              role: newUser.role,
              fullName: newUser.name,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn || '7d' }
          );

          return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
              id: newUser.id,
              email: newUser.email,
              fullName: newUser.name,
              full_name: newUser.name,
              role: newUser.role,
              preferredLanguage: newUser.preferred_language,
            },
          });
        }
      } catch (dbErr) {
        console.warn('[Auth Register DB Warning]:', dbErr.message);
      }
    }

    // Local / Zero-DB Mode: check duplicate
    if (localProfiles.has(normalizedEmail)) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please log in.',
      });
    }

    const mockId = 'user-' + Date.now();
    const mockUser = {
      id: mockId,
      email: normalizedEmail,
      passwordHash,
      full_name: fullName || normalizedEmail.split('@')[0],
      role: role || 'user',
      preferred_language: preferredLanguage || 'en',
      created_at: new Date().toISOString(),
    };

    localProfiles.set(normalizedEmail, mockUser);
    saveProfilesToDisk();

    const token = jwt.sign(
      {
        id: mockId,
        email: normalizedEmail,
        role: mockUser.role,
        fullName: mockUser.full_name,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: mockId,
        email: normalizedEmail,
        fullName: mockUser.full_name,
        full_name: mockUser.full_name,
        role: mockUser.role,
        preferredLanguage: mockUser.preferred_language,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    let normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail.includes('@')) {
      normalizedEmail = `${normalizedEmail}@linguamate.ai`;
    }

    let profile = null;

    if (supabase) {
      try {
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (pData) {
          profile = pData;
        } else {
          const { data: uData } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();
          if (uData) {
            profile = {
              id: uData.id,
              email: uData.email,
              password_hash: uData.password_hash,
              full_name: uData.name || uData.full_name,
              role: uData.role,
              preferred_language: uData.preferred_language,
            };
          }
        }
      } catch (loginErr) {
        console.warn('[Auth Login DB Warning]:', loginErr.message);
      }
    }

    // 1. If user found in database
    if (profile) {
      const isValidPassword = await bcrypt.compare(password, profile.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password. Please check your credentials.',
        });
      }

      const token = jwt.sign(
        {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          fullName: profile.full_name,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn || '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          full_name: profile.full_name,
          role: profile.role,
          preferredLanguage: profile.preferred_language || 'en',
        },
      });
    }

    // 2. Check local fallback profiles (e.g. pre-seeded demo/admin or locally registered accounts)
    const localUser = localProfiles.get(normalizedEmail);
    if (localUser) {
      const isValid = await bcrypt.compare(password, localUser.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password. Please check your credentials.',
        });
      }

      const token = jwt.sign(
        {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role,
          fullName: localUser.full_name,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn || '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: localUser.id,
          email: localUser.email,
          fullName: localUser.full_name,
          full_name: localUser.full_name,
          role: localUser.role,
          preferredLanguage: localUser.preferred_language || 'en',
        },
      });
    }

    // 3. User does NOT exist in Supabase and does NOT exist in local profiles:
    // STRICT 401 REJECTION! Do NOT auto-provision!
    return res.status(401).json({
      success: false,
      error: 'Account not found. Please register an account first before logging in.',
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();

    if (!userId && !userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required or session expired.',
      });
    }

    if (supabase && userId) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, preferred_language, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!profileErr && profile) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        return res.json({
          success: true,
          user: {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            full_name: profile.full_name,
            role: profile.role,
            preferredLanguage: profile.preferred_language || 'en',
            created_at: profile.created_at,
          },
          preferences: preferences || {
            speech_rate: 1.0,
            speech_pitch: 1.0,
            selected_voice: 'default',
            theme: 'dark',
            target_language: profile.preferred_language || 'en',
          },
        });
      }
    }

    // Local / Zero-DB Fallback
    let foundUser = null;
    if (userEmail && localProfiles.has(userEmail)) {
      foundUser = localProfiles.get(userEmail);
    } else {
      for (const u of localProfiles.values()) {
        if (u.id === userId || u.email === userEmail) {
          foundUser = u;
          break;
        }
      }
    }

    if (!foundUser && !req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'User profile not found. Please log in again.',
      });
    }

    const userName = foundUser?.full_name || req.user?.fullName || req.user?.full_name || 'LinguaMate User';
    const userRole = foundUser?.role || req.user?.role || 'user';
    const userLang = foundUser?.preferred_language || 'en';

    const userPrefs = (userId && localPreferences.get(userId)) || {
      speech_rate: 1.0,
      speech_pitch: 1.0,
      selected_voice: 'default',
      theme: 'dark',
      target_language: userLang,
      speed_mode: 'fast',
    };

    return res.json({
      success: true,
      user: {
        id: userId || foundUser?.id,
        email: userEmail || foundUser?.email,
        fullName: userName,
        full_name: userName,
        role: userRole,
        preferredLanguage: userLang,
      },
      preferences: userPrefs,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const updates = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          speech_rate: updates.speechRate,
          speech_pitch: updates.speechPitch,
          selected_voice: updates.selectedVoice,
          target_language: updates.targetLanguage,
          theme: updates.theme,
          auto_play_audio: updates.autoPlayAudio,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, message: 'Preferences updated', preferences: data });
      }
    }

    // Local persistence
    const existing = localPreferences.get(userId) || {};
    const updated = {
      ...existing,
      speech_rate: updates.speechRate ?? existing.speech_rate ?? 1.0,
      speech_pitch: updates.speechPitch ?? existing.speech_pitch ?? 1.0,
      selected_voice: updates.selectedVoice ?? existing.selected_voice ?? 'default',
      target_language: updates.targetLanguage ?? existing.target_language ?? 'en',
      theme: updates.theme ?? existing.theme ?? 'dark',
      auto_play_audio: updates.autoPlayAudio ?? existing.auto_play_audio ?? false,
      speed_mode: updates.speedMode ?? existing.speed_mode ?? 'fast',
    };
    localPreferences.set(userId, updated);
    savePreferencesToDisk();

    return res.json({ success: true, message: 'Preferences updated', preferences: updated });
  } catch (err) {
    next(err);
  }
};
