
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimeTransaction } from "@/types/explore";

export const useAcceptOffer = (
  userId: string | undefined,
  timeBalance: { balance: number } | null,
  refetchOffers: () => void,
  refetchBalance: () => void
) => {
  const { toast } = useToast();

  const handleAcceptOffer = async (offer: TimeTransaction) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to accept offers",
        variant: "destructive",
      });
      return;
    }

    if (offer.user_id === userId) {
      toast({
        title: "Invalid Action",
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

      const { data: updatedOffer, error: updateError } = await supabase
        .from('time_transactions')
        .update({
          status: 'in_progress',
          recipient_id: userId,
        })
        .eq('id', offer.id)
        .eq('status', 'open')
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedOffer) {
        throw new Error('Failed to update offer status');
      }

      const { error: spentError } = await supabase
        .from('time_transactions')
        .insert({
          user_id: userId,
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

      refetchOffers();
      refetchBalance();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
      refetchOffers();
      refetchBalance();
    }
  };

  return { handleAcceptOffer };
};
