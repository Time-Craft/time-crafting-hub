import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OfferActionsProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  onAccept: (offer: TimeTransaction) => Promise<void>;
}

export const OfferActions = ({
  offer,
  currentUserId,
  onAccept,
}: OfferActionsProps) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleAcceptClick = async () => {
    setIsPending(true);
    try {
      // Update the offer status to in_progress
      const { error } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'in_progress',
          recipient_id: currentUserId 
        })
        .eq('id', offer.id);

      if (error) throw error;
      
      await onAccept(offer);
      
      toast({
        title: "Offer Accepted",
        description: "The offer creator will be notified to confirm.",
      });
    } catch (error) {
      console.error('Error in handleAcceptClick:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirmClick = async () => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'accepted',
          completed_at: new Date().toISOString()
        })
        .eq('id', offer.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Offer confirmed successfully!",
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

  const handleDeclineClick = async () => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ status: 'declined' })
        .eq('id', offer.id);

      if (error) throw error;
      
      toast({
        title: "Offer Declined",
        description: "The offer has been declined",
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

  // Show confirm/decline buttons for the creator when offer is in_progress
  if (currentUserId === offer.user_id && offer.status === 'in_progress') {
    return (
      <div className="flex gap-2 mt-4">
        <Button 
          className="flex-1"
          onClick={handleConfirmClick}
          variant="default"
        >
          <Check className="mr-2 h-4 w-4" />
          Confirm
        </Button>
        <Button 
          className="flex-1"
          onClick={handleDeclineClick}
          variant="destructive"
        >
          <X className="mr-2 h-4 w-4" />
          Decline
        </Button>
      </div>
    );
  }

  // Show accept button for others when offer is open
  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="w-full mt-4"
        onClick={handleAcceptClick}
        disabled={isPending}
        variant={isPending ? "outline" : "default"}
      >
        {isPending ? "Processing..." : "Accept Offer"}
      </Button>
    );
  }

  return null;
};