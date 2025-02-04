import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeTransaction } from "@/types/explore";
import { OfferCard } from "./OfferCard";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
}

export const OfferList = ({ offers, currentUserId }: OfferListProps) => {
  const handleAcceptOffer = (offer: TimeTransaction) => {
    // This is now just a placeholder function since we're only handling UI state
    console.log('Offer accepted:', offer.id);
  };

  if (!offers?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No offers available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] p-4">
      <div className="space-y-4">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            currentUserId={currentUserId}
            onAccept={handleAcceptOffer}
          />
        ))}
      </div>
    </ScrollArea>
  );
};