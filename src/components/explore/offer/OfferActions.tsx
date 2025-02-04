import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";

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
    } catch (error) {
      console.error('Error in handleAcceptClick:', error);
    } finally {
      setIsPending(false);
    }
  };

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