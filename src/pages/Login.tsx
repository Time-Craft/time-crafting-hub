import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from '@supabase/supabase-js';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any existing sessions on component mount
    const clearExistingSession = async () => {
      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error('Error clearing session:', signOutError);
          // Don't show error to user as this is just cleanup
        }
      } catch (error) {
        console.error('Unexpected error during session cleanup:', error);
      }
    };
    
    clearExistingSession();

    // Check for existing session after cleanup
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          handleAuthError(sessionError);
          return;
        }
        if (session) {
          handleSuccessfulAuth(session);
        }
      } catch (error) {
        console.error('Session check error:', error);
        await supabase.auth.signOut();
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          handleSuccessfulAuth(session);
        }
      } else if (event === 'SIGNED_OUT') {
        setError(null);
      } else if (event === 'TOKEN_REFRESHED') {
        if (session) {
          handleSuccessfulAuth(session);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSuccessfulAuth = async (session: any) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile check error:', profileError);
        throw profileError;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to TimeCraft",
        duration: 2000,
      });

      if (!profile?.username) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      handleAuthError(error as AuthError);
    }
  };

  const handleAuthError = (error: AuthError) => {
    let errorMessage = 'An error occurred during authentication.';
    
    if (error.message.includes('invalid_credentials')) {
      errorMessage = 'Invalid email or password. Please check your credentials.';
    } else if (error.message.includes('user_already_exists')) {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('email_not_confirmed')) {
      errorMessage = 'Please verify your email address before signing in.';
    } else if (error.message.includes('refresh_token_not_found') || 
               error.message.includes('session_not_found')) {
      errorMessage = 'Your session has expired. Please sign in again.';
      // Force a new sign in when refresh token is invalid
      supabase.auth.signOut();
    }
    
    setError(errorMessage);
    console.error('Auth error:', error);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to TimeCraft</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Login;