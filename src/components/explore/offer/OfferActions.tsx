import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OfferActionsProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  isAccepted: boolean;
  onConfirm: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onAccept: (offer: TimeTransaction) => void;
}

export const OfferActions = ({
  offer,
  currentUserId,
  isAccepted,
  onConfirm,
  onReject,
  onAccept,
}: OfferActionsProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check if user has already interacted with this offer
  useEffect(() => {
    const checkInteraction = async () => {
      if (!currentUserId) return;
      
      const { data, error } = await supabase
        .from('offer_interactions')
        .select('*')
        .eq('offer_id', offer.id)
        .eq('user_id', currentUserId)
        .single();
      
      if (error) {
        console.error('Error checking interaction:', error);
        return;
      }
      
      setHasInteracted(!!data);
    };

    checkInteraction();
  }, [offer.id, currentUserId]);

  const handleAcceptClick = async () => {
    if (!currentUserId || hasInteracted) return;

    try {
      // Record the interaction
      const { error: interactionError } = await supabase
        .from('offer_interactions')
        .insert({
          user_id: currentUserId,
          offer_id: offer.id
        });

      if (interactionError) throw interactionError;

      setHasInteracted(true);
      await onAccept(offer);
    } catch (error) {
      console.error('Error handling accept:', error);
    }
  };

  // Show accept button only if user is not the owner and offer is open
  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="w-full mt-4"
        onClick={handleAcceptClick}
        disabled={hasInteracted}
        variant="secondary"
      >
        {hasInteracted ? 'Pending Request' : 'Accept Offer'}
      </Button>
    );
  }

  // Show confirm/reject buttons only if user is the owner and offer is in progress
  if (currentUserId === offer.user_id && offer.status === 'in_progress') {
    return (
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => onConfirm(offer.id)}
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          <Check className="mr-2 h-4 w-4" /> Confirm
        </Button>
        <Button
          onClick={() => onReject(offer.id)}
          variant="destructive"
          className="flex-1"
        >
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
      </div>
    );
  }

  return null;
};