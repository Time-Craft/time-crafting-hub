import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";
import { useOfferRealtime } from "@/hooks/useOfferRealtime";
import { useOfferManagement } from "@/hooks/useOfferManagement";
import { OfferCard } from "./OfferCard";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  const [acceptedOffers, setAcceptedOffers] = useState<Set<string>>(new Set());
  const { handleDelete, handleConfirmOffer, handleRejectOffer } = useOfferManagement(currentUserId);

  useOfferRealtime(setAcceptedOffers);

  const handleAcceptClick = async (offer: TimeTransaction) => {
    setAcceptedOffers(prev => new Set([...prev, offer.id]));
    await onAcceptOffer(offer);
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
            isAccepted={acceptedOffers.has(offer.id)}
            onDelete={handleDelete}
            onConfirm={handleConfirmOffer}
            onReject={handleRejectOffer}
            onAccept={handleAcceptClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
};