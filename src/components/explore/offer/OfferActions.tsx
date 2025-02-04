import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OfferActionsProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  onAccept: (offer: TimeTransaction) => void;
}

export const OfferActions = ({
  offer,
  currentUserId,
  onAccept,
}: OfferActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAcceptClick = async () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to accept offers",
        variant: "destructive",
      });
      return;
    }

    if (offer.user_id === currentUserId) {
      toast({
        title: "Error",
        description: "You cannot accept your own offer",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check user's balance
      const { data: balance, error: balanceError } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', currentUserId)
        .single();

      if (balanceError) throw balanceError;

      if (!balance || balance.balance < offer.amount) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${offer.amount} hours. Your balance: ${balance?.balance || 0} hours.`,
          variant: "destructive",
        });
        return;
      }

      // Record the interaction
      const { error: interactionError } = await supabase
        .from('offer_interactions')
        .insert({
          user_id: currentUserId,
          offer_id: offer.id
        });

      if (interactionError) {
        console.error('Error recording interaction:', interactionError);
        return;
      }

      // Update offer status
      const { error: updateError } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'in_progress',
          recipient_id: currentUserId 
        })
        .eq('id', offer.id)
        .eq('status', 'open');

      if (updateError) throw updateError;

      await onAccept(offer);
      
      toast({
        title: "Success",
        description: "Offer accepted successfully",
      });
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show accept button only if user is not the owner and offer is open
  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="w-full mt-4"
        onClick={handleAcceptClick}
        disabled={isLoading}
        variant="secondary"
      >
        {isLoading ? "Processing..." : "Accept Offer"}
      </Button>
    );
  }

  return null;
};