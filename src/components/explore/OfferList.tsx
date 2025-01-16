import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeTransaction } from "@/types/explore";
import { useState } from "react";
import { useOfferRealtime } from "@/hooks/useOfferRealtime";
import { useOfferManagement } from "@/hooks/useOfferManagement";
import { OfferCard } from "./OfferCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  const [acceptedOffers, setAcceptedOffers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleDelete, handleConfirmOffer, handleRejectOffer } = useOfferManagement(currentUserId);

  useOfferRealtime(setAcceptedOffers);

  const handleAcceptClick = async (offer: TimeTransaction) => {
    try {
      setAcceptedOffers(prev => new Set([...prev, offer.id]));
      await onAcceptOffer(offer);
    } catch (error: any) {
      // Check specifically for refresh token errors
      if (error?.message?.includes('refresh_token_not_found')) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
        return;
      }
      // Handle other errors
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
      // Remove from accepted offers if there was an error
      setAcceptedOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offer.id);
        return newSet;
      });
    }
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