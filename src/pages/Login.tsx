import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';
import { signIn, signUp, getErrorMessage } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.username) {
          navigate('/home');
        } else {
          navigate('/onboarding');
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .maybeSingle();

              toast({
                title: "Welcome to TimeCraft!",
                description: profile?.username ? "Successfully logged in" : "Let's set up your profile",
                duration: 2000,
              });

              if (!profile?.username) {
                navigate('/onboarding');
              } else {
                navigate('/home');
              }
            } catch (error) {
              console.error('Profile check error:', error);
              setError('Something went wrong. Please try again.');
              await supabase.auth.signOut();
            }
          }, 1000);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleAuth = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isSignUp) {
        const response = await signUp(email, password);
        if (response.user) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
            duration: 5000,
          });
        }
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to TimeCraft</h2>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <AuthForm
          onSubmit={handleAuth}
          isLoading={isLoading}
          error={error}
          buttonText={isSignUp ? 'Sign Up' : 'Sign In'}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;