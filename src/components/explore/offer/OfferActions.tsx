import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";

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
  if (currentUserId !== offer.user_id && offer.status === 'open') {
    return (
      <Button 
        className="mt-4"
        onClick={() => onAccept(offer)}
        disabled={isAccepted}
      >
        {isAccepted ? 'Pending Offer' : 'Accept Offer'}
      </Button>
    );
  }

  if (currentUserId === offer.user_id && offer.status === 'in_progress') {
    return (
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => onConfirm(offer.id)}
          className="bg-green-500 hover:bg-green-600"
          size="sm"
        >
          <Check className="h-4 w-4 mr-1" /> Confirm
        </Button>
        <Button
          onClick={() => onReject(offer.id)}
          variant="destructive"
          size="sm"
        >
          <X className="h-4 w-4 mr-1" /> Reject
        </Button>
      </div>
    );
  }

  return null;
};