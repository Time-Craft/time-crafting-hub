import { User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TimeTransaction } from "@/types/explore";

interface OfferHeaderProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
  onDelete: (offerId: string) => void;
}

export const OfferHeader = ({ offer, currentUserId, onDelete }: OfferHeaderProps) => {
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
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={offer.profiles?.avatar_url || ''} />
          <AvatarFallback>
            <User2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{offer.profiles?.username || 'Anonymous'}</h3>
          <p className="text-sm text-gray-500">{offer.service_type}</p>
        </div>
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
            <User2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
};