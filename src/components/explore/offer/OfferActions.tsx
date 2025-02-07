
import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";
import { Check, X } from "lucide-react";

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

  const handleAcceptClick = async () => {
    setIsPending(true);
    try {
      await onAccept(offer);
    } finally {
      setIsPending(false);
    }
  };

  // Show no buttons for accepted or declined offers
  if (offer.status === 'accepted' || offer.status === 'declined') {
    return null;
  }

  // Show "In Progress" badge for offers that have been accepted and are awaiting confirmation
  if (offer.status === 'in_progress') {
    return (
      <Button 
        className="w-full mt-4"
        disabled={true}
        variant="secondary"
      >
        In Progress - Awaiting Confirmation
      </Button>
    );
  }

  // Show accept button only for open offers and when user is not the creator
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
