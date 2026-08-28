import { supabase } from '../database/supabase';
import { db } from '../database';
import { Capacitor } from '@capacitor/core';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

export interface User {
  id: string;
  email: string;
  username?: string;
}

export class AuthService {
  /**
   * Logs in a user using email and password.
   */
  static async login(email: string, password: string) {
    await this.clearLocalData();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Registers a new user using email, username, and password.
   * Username will be stored in user metadata.
   */
  static async register(email: string, username: string, password: string) {
    await this.clearLocalData();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });
    if (error) throw error;
    return data;
  }

  /**
   * Initiates Google OAuth sign in.
   */
  static async oauthGoogle() {
    await this.clearLocalData();
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleSignIn.initialize({
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '179560489431-u1o6e9ki25nnetmn41um8dgpviuhknfk.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });
        const result = await GoogleSignIn.signIn();
        if (result && result.idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.idToken,
          });
          if (error) throw error;
          return data;
        } else {
          throw new Error('No identity token returned from Google Sign In');
        }
      } catch (err) {
        console.error("Native Google Sign In error", err);
        throw err;
      }
    } else {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      return data;
    }
  }

  /**
   * Initiates Apple OAuth sign in. Uses native plugin on iOS/Android, and standard web redirect on web.
   */
  static async oauthApple() {
    await this.clearLocalData();
    if (Capacitor.isNativePlatform()) {
      try {
        const { response } = await SignInWithApple.authorize({
          clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.monolith.app',
          redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI || 'https://monolith.com/api/auth/callback',
          scopes: 'email name',
        });
        
        if (response && response.identityToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: response.identityToken,
          });
          if (error) throw error;
          return data;
        } else {
          throw new Error('No identity token returned from Apple Sign In');
        }
      } catch (err) {
        console.error("Native Apple Sign In error", err);
        throw err;
      }
    } else {
      // Web fallback
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      if (error) throw error;
      return data;
    }
  }

  /**
   * Sends a password reset email.
   */
  static async passwordReset(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  }

  /**
   * Logs out the current user.
   */
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await this.clearLocalData();
  }

  /**
   * Clears local storage and the PowerSync database.
   */
  static async clearLocalData() {
    // Clear Local Storage
    const preserve = ["theme", "hapticsEnabled", "soundEnabled", "reduceMotion", "weightUnit", "defaultRestTime", "liveActivitiesEnabled"];
    const saved: Record<string, string> = {};
    for (const k of preserve) {
      const v = localStorage.getItem(k);
      if (v !== null) saved[k] = v;
    }
    localStorage.clear();
    for (const k of Object.keys(saved)) localStorage.setItem(k, saved[k]);

    // Clear PowerSync Database if possible
    try {
      if (db.connected) {
        await db.disconnectAndClear();
      }
    } catch (e) {
      console.warn("Could not clear PowerSync database", e);
    }
  }
}
