import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from '@supabase/supabase-js';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanupSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (!sessionError.message.includes('session_not_found')) {
            console.error('Session check error:', sessionError);
          }
          return;
        }

        if (session) {
          const { error: signOutError } = await supabase.auth.signOut({
            scope: 'local'
          });
          
          if (signOutError) {
            if (!signOutError.message.includes('session_not_found') && 
                !signOutError.message.includes('refresh_token_not_found')) {
              console.error('Error during session cleanup:', signOutError);
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error during session cleanup:', error);
      }
    };

    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (!sessionError.message.includes('session_not_found')) {
            handleAuthError(sessionError);
          }
          return;
        }

        if (session) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile check error:', profileError);
            return;
          }

          // Check if time balance exists
          const { data: balance, error: balanceError } = await supabase
            .from('time_balances')
            .select('balance')
            .eq('id', session.user.id)
            .single();

          if (balanceError) {
            console.error('Balance check error:', balanceError);
            return;
          }

          handleSuccessfulAuth(session);
        }
      } catch (error) {
        console.error('Session check error:', error);
        await cleanupSession();
      }
    };

    cleanupSession().then(() => checkSession());

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          // Wait briefly to allow triggers to complete
          setTimeout(async () => {
            try {
              // Verify profile creation
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                throw new Error('Profile creation failed');
              }

              // Verify time balance creation
              const { data: balance, error: balanceError } = await supabase
                .from('time_balances')
                .select('balance')
                .eq('id', session.user.id)
                .single();

              if (balanceError) {
                throw new Error('Time balance initialization failed');
              }

              handleSuccessfulAuth(session);
            } catch (error) {
              console.error('Verification error:', error);
              setError('Account setup failed. Please try again.');
              await supabase.auth.signOut();
            }
          }, 1000); // Wait 1 second for triggers to complete
        }
      } else if (event === 'SIGNED_OUT') {
        setError(null);
        navigate('/login', { replace: true });
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
        if (!profileError.message.includes('session_not_found')) {
          console.error('Profile check error:', profileError);
          throw profileError;
        }
      }

      toast({
        title: "Welcome to TimeCraft!",
        description: profile?.username ? "Successfully logged in" : "Let's set up your profile",
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

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes('already registered')) {
            return 'This email is already registered. Please sign in instead.';
          } else if (error.message.includes('invalid_credentials')) {
            return 'Invalid email or password. Please check your credentials and try again.';
          }
          return 'Invalid email or password. Please check your credentials.';
        case 422:
          return 'Invalid email format. Please enter a valid email address.';
        case 401:
          return 'Invalid credentials. Please check your email and password.';
        default:
          return error.message;
      }
    }
    return error.message;
  };

  const handleAuthError = (error: AuthError) => {
    let errorMessage = getErrorMessage(error);
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