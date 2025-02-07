
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
import type { TimeTransaction } from "@/types/explore";
import { useEffect } from "react";

export const PendingOffers = () => {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingOffers, isLoading } = useQuery({
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
          ),
          recipient:recipient_id (
            username,
            avatar_url
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'in_progress')
        .eq('type', 'earned');

      if (error) throw error;
      return data as TimeTransaction[];
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  // Subscribe to realtime updates for pending offers
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('public:time_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pending-offers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);

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

      // Also update the recipient's spent transaction
      const { error: recipientError } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'accepted',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', offer.recipient_id)
        .eq('recipient_id', session?.user?.id)
        .eq('service_type', offer.service_type)
        .eq('status', 'in_progress');

      if (recipientError) throw recipientError;

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

      // Also update the recipient's spent transaction
      const { error: recipientError } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'declined',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', offer.recipient_id)
        .eq('recipient_id', session?.user?.id)
        .eq('service_type', offer.service_type)
        .eq('status', 'in_progress');

      if (recipientError) throw recipientError;

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

  return (
    <section className="p-6">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Confirmations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
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
  );
};
