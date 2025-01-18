import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAccept(offer);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show accept button only if user is not the owner and offer is open
  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="w-full mt-4"
        onClick={handleAcceptClick}
        disabled={isSubmitting}
      >
        {isAccepted ? 'Pending Request' : 'Accept Offer'}
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