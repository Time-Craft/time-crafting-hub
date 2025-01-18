import { Clock, Calendar, ArrowUpRight, ArrowDownRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { TimeTransaction } from "@/types/explore";

const Home = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's time balance with real-time updates
  const { data: timeBalance } = useQuery({
    queryKey: ['time-balance'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return null;
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
          return null;
        }
        throw error;
      }

      return data?.balance || 0;
    }
  });

  // Set up real-time subscription for balance updates
  useEffect(() => {
    const { data: { session } } = supabase.auth.getSession();
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('time_balances_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_balances',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Balance update:', payload);
          queryClient.invalidateQueries({ queryKey: ['time-balance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch user's transaction statistics with real-time updates
  const { data: stats } = useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: transactions, error } = await supabase
        .from('time_transactions')
        .select('*')
        .or(`user_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`);

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
          return null;
        }
        throw error;
      }

      return {
        activeServices: transactions?.filter(t => t.status === 'in_progress').length || 0,
        upcomingSessions: transactions?.filter(t => t.status === 'accepted' && !t.completed_at).length || 0,
        completedExchanges: transactions?.filter(t => 
          t.status === 'accepted' && t.completed_at
        ).length || 0,
        earnedHours: transactions
          ?.filter(t => 
            t.type === 'earned' && 
            t.status === 'accepted' && 
            t.completed_at && 
            t.user_id === session.user.id
          )
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        spentHours: transactions
          ?.filter(t => 
            t.type === 'spent' && 
            t.status === 'accepted' && 
            t.completed_at && 
            t.user_id === session.user.id
          )
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
      };
    }
  });

  // Set up real-time subscription for transaction updates
  useEffect(() => {
    const { data: { session } } = supabase.auth.getSession();
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
        (payload) => {
          console.log('Transaction update:', payload);
          queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
          queryClient.invalidateQueries({ queryKey: ['pending-offers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: pendingOffers, refetch: refetchPendingOffers } = useQuery({
    queryKey: ['pending-offers'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login', { replace: true });
          return [];
        }

        const { data, error } = await supabase
          .from('time_transactions')
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false });

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
            return [];
          }
          throw error;
        }
        return data as TimeTransaction[];
      } catch (error: any) {
        console.error('Error fetching pending offers:', error);
        toast({
          title: "Error",
          description: "Failed to load pending offers. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  const handleConfirmOffer = async (offer: TimeTransaction) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'accepted',
          completed_at: now
        })
        .eq('id', offer.id);

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
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Offer confirmed and completed successfully",
      });
      refetchPendingOffers();
    } catch (error: any) {
      console.error('Error confirming offer:', error);
      toast({
        title: "Error",
        description: "Failed to confirm offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineOffer = async (offer: TimeTransaction) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ status: 'declined' })
        .eq('id', offer.id);

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
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Offer declined successfully",
      });
      refetchPendingOffers();
    } catch (error: any) {
      console.error('Error declining offer:', error);
      toast({
        title: "Error",
        description: "Failed to decline offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate('/login', { replace: true });
          return;
        }

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
        console.error('Auth check error:', error);
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-primary/5 p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {username}</h1>
          <p className="text-gray-600 mt-1">Balance: {timeBalance || 0} hours</p>
        </div>
      </header>

      {/* Pending Offers Section */}
      <section className="p-6">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!pendingOffers?.length ? (
                  <p className="text-gray-500 text-center">No pending offers to confirm</p>
                ) : (
                  pendingOffers?.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{offer.service_type}</h3>
                          <p className="text-sm text-gray-600">{offer.description}</p>
                          <p className="text-sm font-medium mt-1">{offer.amount} hours</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmOffer(offer)}
                          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                        >
                          Complete & Confirm
                        </button>
                        <button
                          onClick={() => handleDeclineOffer(offer)}
                          className="bg-destructive text-white px-4 py-2 rounded hover:bg-destructive/90"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary-light">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="text-primary" />
                  <span className="text-sm text-gray-600">Time Earned</span>
                </div>
                <p className="text-2xl font-semibold mt-2">{stats?.earnedHours || 0} hrs</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="text-primary" />
                  <span className="text-sm text-gray-600">Time Spent</span>
                </div>
                <p className="text-2xl font-semibold mt-2">{stats?.spentHours || 0} hrs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="p-6 pt-0">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary" />
                    <span>Active Services</span>
                  </div>
                  <span className="font-semibold">{stats?.activeServices || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary" />
                    <span>Upcoming Sessions</span>
                  </div>
                  <span className="font-semibold">{stats?.upcomingSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-primary" />
                    <span>Completed Exchanges</span>
                  </div>
                  <span className="font-semibold">{stats?.completedExchanges || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default Home;