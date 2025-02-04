import { Card } from "@/components/ui/card";
import type { TimeTransaction } from "@/types/explore";
import { OfferHeader } from "./offer/OfferHeader";
import { OfferActions } from "./offer/OfferActions";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface OfferCardProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  onAccept: (offer: TimeTransaction) => Promise<void>;
}

export const OfferCard = ({
  offer,
  currentUserId,
  onAccept,
}: OfferCardProps) => {
  const handleAccept = async (offer: TimeTransaction) => {
    await onAccept(offer);
  };

  return (
    <Card className="p-6 animate-fadeIn hover:shadow-md transition-all bg-white border-gray-100">
      <div className="flex flex-col gap-4">
          offer={offer}
          currentUserId={currentUserId}
        />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-primary" />
            <span>{offer.amount} hours</span>
            <Badge variant="outline" className="ml-auto">
              {offer.status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            {offer.description}
          </p>
          
          <Badge variant="secondary" className="w-fit bg-primary-light text-primary hover:bg-primary-light">
            {offer.service_type}
          </Badge>
        </div>
        
        <OfferActions
          offer={offer}
          currentUserId={currentUserId}
          onAccept={handleAccept}
        />
      </div>
    </Card>
  );
};