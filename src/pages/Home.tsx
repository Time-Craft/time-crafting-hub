import { Clock, Calendar, ArrowUpRight, ArrowDownRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { TimeTransaction } from "@/types/explore";

const Home = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch pending offers that need confirmation
  const { data: pendingOffers, refetch: refetchPendingOffers } = useQuery({
    queryKey: ['pending-offers'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

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

      if (error) throw error;
      return data as TimeTransaction[];
    }
  });

  const handleConfirmOffer = async (offer: TimeTransaction) => {
    const { error } = await supabase
      .from('time_transactions')
      .update({ status: 'accepted' })
      .eq('id', offer.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to confirm offer",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Offer confirmed successfully",
    });
    refetchPendingOffers();
  };

  const handleDeclineOffer = async (offer: TimeTransaction) => {
    const { error } = await supabase
      .from('time_transactions')
      .update({ status: 'declined' })
      .eq('id', offer.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to decline offer",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Offer declined successfully",
    });
    refetchPendingOffers();
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      setUsername(profile?.username || session.user.email?.split('@')[0] || 'User');
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <header className="bg-primary/5 p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {username}</h1>
          <p className="text-gray-600 mt-1">Current Status: Available</p>
        </div>
      </header>

      {/* Time Balance Section */}
      <section className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary-light">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="text-primary" />
                  <span className="text-sm text-gray-600">Time Earned</span>
                </div>
                <p className="text-2xl font-semibold mt-2">12.5 hrs</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="text-primary" />
                  <span className="text-sm text-gray-600">Time Spent</span>
                </div>
                <p className="text-2xl font-semibold mt-2">8.0 hrs</p>
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
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary" />
                    <span>Upcoming Sessions</span>
                  </div>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-primary" />
                    <span>Completed Exchanges</span>
                  </div>
                  <span className="font-semibold">15</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pending Offers Section */}
      <section className="p-6 pt-0">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOffers?.length === 0 ? (
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
                          Confirm
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

      <BottomNav />
    </div>
  );
};

export default Home;
