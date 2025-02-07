
import { TimeTransaction } from "@/types/explore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";

interface PendingOfferCardProps {
  offer: TimeTransaction;
  onConfirm: (offer: TimeTransaction) => Promise<void>;
  onDecline: (offer: TimeTransaction) => Promise<void>;
}

export const PendingOfferCard = ({
  offer,
  onConfirm,
  onDecline,
}: PendingOfferCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">{offer.service_type}</h3>
          <p className="text-sm text-gray-600">{offer.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{offer.amount} hours</span>
            <Badge variant="secondary" className="ml-2">
              Pending Confirmation
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Requested by: {offer.profiles?.username || 'Anonymous'}
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Button
          onClick={() => onConfirm(offer)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
        >
          <Check className="mr-2 h-5 w-5" />
          Complete & Confirm
        </Button>
        <Button
          onClick={() => onDecline(offer)}
          variant="destructive"
          className="flex-1"
        >
          <X className="mr-2 h-5 w-5" />
          Decline
        </Button>
      </div>
    </div>
  );
};
