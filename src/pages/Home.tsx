import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { HomeHeader } from "@/components/home/HomeHeader";
import { PendingOffers } from "@/components/home/PendingOffers";
import { StatsCards } from "@/components/home/StatsCards";
import { QuickStats } from "@/components/home/QuickStats";

const Home = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          if (profileError.message.includes('refresh_token_not_found') || 
              profileError.message.includes('session_not_found')) {
            toast({
              title: "Session Expired",
              description: "Please sign in again to continue.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            navigate('/login', { replace: true });
            return;
          }
          throw profileError;
        }

        setUsername(profile?.username || session.user.email?.split('@')[0] || 'User');
      } catch (error: any) {
        console.error('Profile loading error:', error);
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }
    };

    loadProfile();
  }, [navigate, session?.user, toast]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('time_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions',
          filter: `or(user_id.eq.${session.user.id},recipient_id.eq.${session.user.id})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pending-offers'] });
          queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
          queryClient.invalidateQueries({ queryKey: ['time-balance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, session?.user?.id]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <HomeHeader username={username} />
      <PendingOffers />
      <StatsCards />
      <QuickStats />
      <BottomNav />
    </div>
  );
};

export default Home;