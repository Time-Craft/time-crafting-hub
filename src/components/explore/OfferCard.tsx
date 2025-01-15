import { User2, Trash2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TimeTransaction } from "@/types/explore";

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
  const getStatusBadgeColor = (status: TimeTransaction['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={offer.profiles?.avatar_url || ''} />
          <AvatarFallback>
            <User2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{offer.profiles?.username || 'Anonymous'}</h3>
              <p className="text-sm text-gray-500">{offer.service_type}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge className={getStatusBadgeColor(offer.status)}>
                {offer.status}
              </Badge>
              <Badge>{offer.amount} hours</Badge>
              {currentUserId === offer.user_id && offer.status === 'open' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(offer.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{offer.description}</p>
          
          {currentUserId !== offer.user_id && offer.status === 'open' && (
            <Button 
              className="mt-4"
              onClick={() => onAccept(offer)}
              disabled={isAccepted}
            >
              {isAccepted ? 'Pending Offer' : 'Accept Offer'}
            </Button>
          )}

          {currentUserId === offer.user_id && offer.status === 'in_progress' && (
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
          )}

          {offer.status === 'in_progress' && (
            <p className="mt-4 text-sm text-yellow-600 font-medium">
              {currentUserId === offer.user_id 
                ? 'Someone has accepted your offer. Please confirm or decline.'
                : 'Waiting for confirmation from the offer creator'}
            </p>
          )}

          {offer.status === 'accepted' && (
            <p className="mt-4 text-sm text-green-600 font-medium">
              This offer has been accepted and confirmed
            </p>
          )}

          {offer.status === 'declined' && (
            <p className="mt-4 text-sm text-red-600 font-medium">
              This offer has been declined
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};