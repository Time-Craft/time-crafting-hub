
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import type { TimeTransaction } from "@/types/explore";

export const useExploreOffers = () => {
  const session = useSession();
  const { toast } = useToast();

  const { data: timeBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['timeBalance', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5
  });

  const { data: offers, refetch: refetchOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('time_transactions')
        .select(`
          *,
          profiles!fk_user_profile (
            username,
            avatar_url
          ),
          recipient:profiles!fk_recipient_profile (
            username,
            avatar_url
          )
        `)
        .eq('type', 'earned')
        .eq('status', 'open')
        .neq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TimeTransaction[];
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5
  });

  // Subscribe to realtime updates for offers and balances
  useEffect(() => {
    if (!session?.user?.id) return;

    const offersChannel = supabase
      .channel('public:time_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions',
        },
        () => {
          console.log('Received realtime update for transactions, refetching...');
          refetchOffers();
        }
      )
      .subscribe();

    const balancesChannel = supabase
      .channel('public:time_balances')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'time_balances',
          filter: `id=eq.${session.user.id}`,
        },
        () => {
          console.log('Received realtime update for balance, refetching...');
          refetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(balancesChannel);
    };
  }, [session?.user?.id, refetchOffers, refetchBalance]);

  const handleAcceptOffer = async (offer: TimeTransaction) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to accept offers",
        variant: "destructive",
      });
      return;
    }

    if (offer.user_id === session.user.id) {
      toast({
        title: "Invalid Action",
        description: "You cannot accept your own offer",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have the latest balance
    await refetchBalance();

    if (!timeBalance || timeBalance.balance < offer.amount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${offer.amount} hours to accept this offer. Your balance: ${timeBalance?.balance || 0} hours`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Start a Supabase transaction
      const { data: currentOffer, error: checkError } = await supabase
        .from('time_transactions')
        .select('status')
        .eq('id', offer.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!currentOffer || currentOffer.status !== 'open') {
        toast({
          title: "Offer Unavailable",
          description: "This offer is no longer available",
          variant: "destructive",
        });
        refetchOffers();
        return;
      }

      // Update the original offer to in_progress
      const { data: updatedOffer, error: updateError } = await supabase
        .from('time_transactions')
        .update({
          status: 'in_progress',
          recipient_id: session.user.id,
        })
        .eq('id', offer.id)
        .eq('status', 'open')
        .select()
        .single();

      if (updateError) throw updateError;
      if (!updatedOffer) {
        throw new Error('Failed to update offer status');
      }

      // Create a spent transaction for the recipient
      const { error: spentError } = await supabase
        .from('time_transactions')
        .insert({
          user_id: session.user.id,
          recipient_id: offer.user_id,
          type: 'spent',
          amount: offer.amount,
          service_type: offer.service_type,
          description: offer.description,
          status: 'in_progress'
        });

      if (spentError) throw spentError;

      toast({
        title: "Success",
        description: "Offer accepted successfully! Waiting for creator confirmation.",
      });

      // Refetch data to update UI
      refetchOffers();
      refetchBalance();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
      // Refetch to ensure UI is in sync with server state
      refetchOffers();
      refetchBalance();
    }
  };

  return {
    offers,
    refetchOffers,
    handleAcceptOffer,
  };
};
