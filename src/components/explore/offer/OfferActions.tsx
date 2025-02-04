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

  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="w-full mt-4"
        onClick={handleAcceptClick}
        disabled={isPending}
        variant={isPending ? "outline" : "default"}
      >
        {isPending ? "Pending..." : "Accept Offer"}
      </Button>
    );
  }

  return null;
};