import { Card } from "@/components/ui/card";
import type { TimeTransaction } from "@/types/explore";
import { OfferHeader } from "./offer/OfferHeader";
import { OfferActions } from "./offer/OfferActions";
import { OfferStatus } from "./offer/OfferStatus";

interface OfferCardProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  isAccepted: boolean;
  onDelete: (offerId: string) => void;
  onConfirm: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onAccept: (offer: TimeTransaction) => void;
}

export const OfferCard = ({
  offer,
  currentUserId,
  isAccepted,
  onDelete,
  onConfirm,
  onReject,
  onAccept,
}: OfferCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <OfferHeader 
          offer={offer}
          currentUserId={currentUserId}
          onDelete={onDelete}
        />
        
        <p className="text-sm text-gray-600">{offer.description}</p>
        
        <OfferActions
          offer={offer}
          currentUserId={currentUserId}
          isAccepted={isAccepted}
          onConfirm={onConfirm}
          onReject={onReject}
          onAccept={onAccept}
        />
        
        <OfferStatus
          offer={offer}
          currentUserId={currentUserId}
        />
      </div>
    </Card>
  );
};