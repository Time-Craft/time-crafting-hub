import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeTransaction } from "@/types/explore";
import { useOfferManagement } from "@/hooks/useOfferManagement";
import { OfferCard } from "./OfferCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleDelete, handleConfirmOffer, handleRejectOffer } = useOfferManagement(currentUserId);

  const handleAcceptClick = async (offer: TimeTransaction) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to accept offers",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check user's balance before accepting
      const { data: balance, error: balanceError } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', currentUserId)
        .single();

      if (balanceError) throw balanceError;

      if (!balance || balance.balance < offer.amount) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${offer.amount} hours to accept this offer. Your current balance is ${balance?.balance || 0} hours.`,
          variant: "destructive",
        });
        return;
      }

      // Update the offer status in the database
      const { error: updateError } = await supabase
        .from('time_transactions')
        .update({ 
          status: 'in_progress',
          recipient_id: currentUserId 
        })
        .eq('id', offer.id)
        .eq('status', 'open');

      if (updateError) throw updateError;

      await onAcceptOffer(offer);
      
      toast({
        title: "Success",
        description: "Offer accepted successfully. Waiting for confirmation.",
      });
    } catch (error: any) {
      if (error?.message?.includes('refresh_token_not_found')) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
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