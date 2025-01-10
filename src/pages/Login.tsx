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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session?.user.id)
          .single();

        toast({
          title: "Welcome back!",
          description: "Successfully logged in to TimeCraft",
          duration: 2000,
        });

        // If no username is set, redirect to onboarding
        if (!profile?.username) {
          navigate('/onboarding');
        } else {
          navigate('/home');
        }
      } else if (event === 'SIGNED_OUT') {
        setError(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        const { error: authError } = await supabase.auth.getSession();
        if (authError) {
          handleAuthError(authError);
        }
      }
    });

    // Listen for auth errors
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && !session) {
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      authListener.data.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleAuthError = (error: AuthError) => {
    let errorMessage = 'An error occurred during authentication.';
    
    if (error.message.includes('invalid_credentials')) {
      errorMessage = 'Invalid email or password. Please check your credentials.';
    } else if (error.message.includes('user_already_exists')) {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('email_not_confirmed')) {
      errorMessage = 'Please verify your email address before signing in.';
    }
    
    setError(errorMessage);
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