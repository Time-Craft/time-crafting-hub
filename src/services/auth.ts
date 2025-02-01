import { AuthError, AuthApiError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: {
        email: email,
      }
    }
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getErrorMessage = (error: AuthError) => {
  if (error instanceof AuthApiError) {
    switch (error.status) {
      case 400:
        if (error.message.includes('already registered')) {
          return 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('invalid_credentials')) {
          return 'Invalid email or password. Please check your credentials and try again.';
        }
        return 'Please check your email and password.';
      case 422:
        return 'Please enter a valid email address.';
      case 401:
        return 'Invalid credentials. Please check your email and password.';
      case 500:
        if (error.message.includes('Database error')) {
          return 'There was an issue creating your account. Please try again later.';
        }
        return 'An unexpected error occurred. Please try again later.';
      default:
        return error.message;
    }
  }
  return error.message;
};