import { User2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimeTransaction } from "@/types/explore";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  const { toast } = useToast();

  const handleStatusUpdate = async (offer: TimeTransaction, newStatus: TimeTransaction['status']) => {
    const { error } = await supabase
      .from('time_transactions')
      .update({ status: newStatus })
      .eq('id', offer.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
      return;
    }

    const statusMessages = {
      in_progress: "Offer accepted successfully. Waiting for confirmation.",
      accepted: "Offer confirmed successfully",
      open: "Offer declined",
      declined: "Offer declined"
    };

    toast({
      title: "Success",
      description: statusMessages[newStatus],
    });
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
                    onClick={() => {
                      onAcceptOffer(offer);
                      handleStatusUpdate(offer, 'in_progress');
                    }}
                  >
                    Accept Offer
                  </Button>
                )}

                {/* Show Confirm/Decline buttons only to offer creator when status is in_progress */}
                {currentUserId === offer.user_id && offer.status === 'in_progress' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleStatusUpdate(offer, 'accepted')}
                      variant="default"
                    >
                      Confirm
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate(offer, 'declined')}
                      variant="destructive"
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {/* Show status message when offer is accepted */}
                {offer.status === 'accepted' && (
                  <p className="mt-4 text-sm text-green-600 font-medium">
                    This offer has been accepted and confirmed
                  </p>
                )}

                {/* Show status message when offer is declined */}
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