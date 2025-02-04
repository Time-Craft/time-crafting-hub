import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";

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
  const [isPending, setIsPending] = useState(false);

  const handleAcceptClick = () => {
    setIsPending(true);
    onAccept(offer);
  };

  // Show accept button only if user is not the owner and offer is open
  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="w-full mt-4"
        onClick={handleAcceptClick}
        disabled={isPending}
        variant={isPending ? "outline" : "secondary"}
      >
        {isPending ? "Pending..." : "Accept Offer"}
      </Button>
    );
  }

  return null;
};