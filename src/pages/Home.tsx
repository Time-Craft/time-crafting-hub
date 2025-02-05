import { Clock, Calendar, ArrowUpRight, ArrowDownRight, Trophy, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { TimeTransaction } from "@/types/explore";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in garbage collection for 30 minutes
  });

  // Fetch pending offers that need confirmation with proper caching
  const { data: pendingOffers, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['pending-offers'],
    queryFn: async () => {
      if (!session?.user?.id) return [];

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
        .eq('status', 'in_progress');

      if (error) throw error;
      return data as TimeTransaction[];
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep data in garbage collection for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const handleConfirmOffer = async (offer: TimeTransaction) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'accepted',
          completed_at: new Date().toISOString()
        })
        .eq('id', offer.id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['pending-offers'] });
      queryClient.invalidateQueries({ queryKey: ['time-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });

      toast({
        title: "Success",
        description: "Service completed and confirmed successfully",
      });
    } catch (error) {
      console.error('Error confirming offer:', error);
      toast({
        title: "Error",
        description: "Failed to confirm offer",
        variant: "destructive",
      });
    }
  };

  const handleDeclineOffer = async (offer: TimeTransaction) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'declined',
          completed_at: new Date().toISOString()
        })
        .eq('id', offer.id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['pending-offers'] });
      queryClient.invalidateQueries({ queryKey: ['time-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });

      toast({
        title: "Success",
        description: "Offer declined successfully",
      });
    } catch (error) {
      console.error('Error declining offer:', error);
      toast({
        title: "Error",
        description: "Failed to decline offer",
        variant: "destructive",
      });
    }
  };

  const { data: stats } = useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      if (!session?.user?.id) return null;

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
    },
    enabled: !!session?.user?.id
  });

  // Set up real-time subscription for transaction updates
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
        (payload) => {
          console.log('Transaction update:', payload);
          // Invalidate queries to trigger refetch when data changes
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
              <CardTitle className="text-lg">Pending Confirmations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingOffers ? (
                  <p className="text-gray-500 text-center">Loading offers...</p>
                ) : !pendingOffers?.length ? (
                  <p className="text-gray-500 text-center">No pending offers to confirm</p>
                ) : (
                  pendingOffers?.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900">{offer.service_type}</h3>
                          <p className="text-sm text-gray-600">{offer.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{offer.amount} hours</span>
                            <Badge variant="secondary" className="ml-2">
                              Pending Confirmation
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Requested by: {offer.profiles?.username || 'Anonymous'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => handleConfirmOffer(offer)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="mr-2 h-5 w-5" />
                          Complete & Confirm
                        </Button>
                        <Button
                          onClick={() => handleDeclineOffer(offer)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="mr-2 h-5 w-5" />
                          Decline
                        </Button>
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
