import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OfferActionsProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  onAccept: (offer: TimeTransaction) => void;
  onDelete?: (offerId: string) => Promise<void>;
  onConfirm?: (offerId: string) => Promise<void>;
  onReject?: (offerId: string) => Promise<void>;
}

export const OfferActions = ({
  offer,
  currentUserId,
  onAccept,
  onDelete,
  onConfirm,
  onReject,
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
        .maybeSingle();

      if (balanceError) throw balanceError;

      if (!balance || balance.balance < offer.amount) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${offer.amount} hours. Your balance: ${balance?.balance || 0} hours.`,
          variant: "destructive",
        });
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

  // Show action buttons for the offer owner
  if (currentUserId === offer.user_id) {
    if (offer.status === 'open' && onDelete) {
      return (
        <Button 
          className="w-full mt-4"
          onClick={() => onDelete(offer.id)}
          variant="destructive"
        >
          Delete Offer
        </Button>
      );
    }

    if (offer.status === 'in_progress' && onConfirm && onReject) {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1"
            onClick={() => onConfirm(offer.id)}
            variant="default"
          >
            Confirm
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onReject(offer.id)}
            variant="destructive"
          >
            Reject
          </Button>
        </div>
      );
    }
  }

  return null;
};