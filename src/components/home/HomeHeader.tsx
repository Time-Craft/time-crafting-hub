import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

export const HomeHeader = ({ username }: { username: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();

  const { data: timeBalance = 30 } = useQuery({
    queryKey: ['time-balance'],
    queryFn: async () => {
      if (!session?.user?.id) {
        navigate('/login', { replace: true });
        return 30;
      }

      const { data, error } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', session.user.id)
        .single();

      if (error) {
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('session_not_found')) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
          return 30;
        }
        throw error;
      }

      return data?.balance || 30;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return (
    <header className="bg-primary/5 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {username}</h1>
        <p className="text-gray-600 mt-1">Balance: {timeBalance || 0} hours</p>
      </div>
    </header>
  );
};