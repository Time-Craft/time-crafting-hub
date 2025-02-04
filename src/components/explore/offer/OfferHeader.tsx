import { User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TimeTransaction } from "@/types/explore";

interface OfferHeaderProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
}

export const OfferHeader = ({ offer }: OfferHeaderProps) => {
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
      <Badge variant="secondary">
        {offer.amount} hours
      </Badge>
    </div>
  );
};