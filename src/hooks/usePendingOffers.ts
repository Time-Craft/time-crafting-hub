
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { TimeTransaction } from "@/types/explore";

export const usePendingOffers = () => {
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

  return {
    pendingOffers,
    isLoading,
    handleConfirmOffer,
    handleDeclineOffer,
  };
};
