import { Card } from "@/components/ui/card";
import type { TimeTransaction } from "@/types/explore";
import { OfferHeader } from "./offer/OfferHeader";
import { OfferActions } from "./offer/OfferActions";
import { OfferStatus } from "./offer/OfferStatus";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface OfferCardProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  onAccept: (offer: TimeTransaction) => void;
  onConfirm: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onDelete: (offerId: string) => void;
}

export const OfferCard = ({
  offer,
  currentUserId,
  onAccept,
  onConfirm,
  onReject,
  onDelete,
}: OfferCardProps) => {
  const isAccepted = offer.status === 'in_progress';
  const isOwner = currentUserId === offer.user_id;
  const isRecipient = currentUserId === offer.recipient_id;

  return (
    <Card className="p-4 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <OfferHeader 
          offer={offer}
          currentUserId={currentUserId}
          onDelete={onDelete}
        />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{offer.amount} hours</span>
            <Badge variant="outline" className="ml-auto">
              {offer.status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">{offer.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {offer.service_type}
            </Badge>
          </div>
        </div>
        
        <OfferActions
          offer={offer}
          currentUserId={currentUserId}
          isAccepted={isAccepted}
          onConfirm={onConfirm}
          onReject={onReject}
          onAccept={onAccept}
        />
        
        {(isOwner || isRecipient) && (
          <OfferStatus
            offer={offer}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </Card>
  );
};