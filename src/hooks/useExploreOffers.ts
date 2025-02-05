import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import type { TimeTransaction } from "@/types/explore";

export const useExploreOffers = () => {
  const session = useSession();
  const { toast } = useToast();

  const { data: timeBalance } = useQuery({
    queryKey: ['timeBalance', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5 // 5 minutes
  });

  const { data: offers, refetch: refetchOffers } = useQuery({
    queryKey: ['offers'],
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
        .eq('type', 'earned')
        .neq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TimeTransaction[];
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5 // 5 minutes
  });

  const handleAcceptOffer = async (offer: TimeTransaction) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to accept offers",
        variant: "destructive",
      });
      return;
    }

    if (offer.user_id === session.user.id) {
      toast({
        title: "Error",
        description: "You cannot accept your own offer",
        variant: "destructive",
      });
      return;
    }

    if (!timeBalance || timeBalance.balance < offer.amount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${offer.amount} hours to accept this offer. Your balance: ${timeBalance?.balance || 0} hours`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({
          status: 'in_progress',
          recipient_id: session.user.id
        })
        .eq('id', offer.id)
        .eq('status', 'open');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer accepted successfully! The creator will be notified.",
      });

      refetchOffers();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    offers,
    refetchOffers,
    handleAcceptOffer,
  };
};