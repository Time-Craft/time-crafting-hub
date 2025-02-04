import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeTransaction } from "@/types/explore";
import { OfferCard } from "./OfferCard";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  if (!offers?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
        <p className="text-lg font-medium">No offers available</p>
        <p className="text-sm">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4 p-4">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            currentUserId={currentUserId}
            onAccept={onAcceptOffer}
          />
        ))}
      </div>
    </ScrollArea>
  );
};