import { User2, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimeTransaction } from "@/types/explore";
import { useEffect, useState } from "react";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  const { toast } = useToast();
  const [acceptedOffers, setAcceptedOffers] = useState<Set<string>>(new Set());

  // Subscribe to real-time updates for offer statuses
  useEffect(() => {
    const channel = supabase
      .channel('public:time_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions'
        },
        (payload) => {
          // Update local state when offer status changes
          if (payload.new && 'status' in payload.new) {
            const updatedOffer = payload.new as TimeTransaction;
            if (updatedOffer.status === 'accepted' || updatedOffer.status === 'declined') {
              setAcceptedOffers(prev => new Set([...prev, updatedOffer.id]));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcceptOffer = async (offer: TimeTransaction) => {
    try {
      // Update the offer status to 'in_progress' and set the recipient_id
      const { error } = await supabase
        .from('time_transactions')
        .update({
          status: 'in_progress',
          recipient_id: currentUserId
        })
        .eq('id', offer.id);

      if (error) throw error;

      // Update local state
      setAcceptedOffers(prev => new Set([...prev, offer.id]));
      onAcceptOffer(offer);

      toast({
        title: "Offer Accepted",
        description: "Waiting for the offer creator to confirm.",
      });
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .delete()
        .eq('id', offerId)
        .eq('user_id', currentUserId); // Ensure only the creator can delete

      if (error) throw error;

      toast({
        title: "Offer Deleted",
        description: "Your offer has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <Card key={offer.id} className="p-4">
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
                    {currentUserId === offer.user_id && offer.status === 'open' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Badge className={getStatusBadgeColor(offer.status)}>
                      {offer.status}
                    </Badge>
                    <Badge>{offer.amount} hours</Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{offer.description}</p>
                
                {/* Show Accept button only if user is not the offer creator and offer is open */}
                {currentUserId !== offer.user_id && offer.status === 'open' && (
                  <Button 
                    className="mt-4"
                    onClick={() => handleAcceptOffer(offer)}
                    disabled={offer.status !== 'open'}
                  >
                    Accept Offer
                  </Button>
                )}

                {/* Status messages */}
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
        ))}
      </div>
    </ScrollArea>
  );
};