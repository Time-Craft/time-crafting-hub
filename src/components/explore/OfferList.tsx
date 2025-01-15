import { User2, Trash2, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimeTransaction } from "@/types/explore";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface OfferListProps {
  offers: TimeTransaction[] | null;
  currentUserId: string | undefined;
  onAcceptOffer: (offer: TimeTransaction) => void;
}

export const OfferList = ({ offers, currentUserId, onAcceptOffer }: OfferListProps) => {
  const { toast } = useToast();
  const [acceptedOffers, setAcceptedOffers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

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
          console.log('Received real-time update:', payload);
          if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['offers'], (oldData: TimeTransaction[] | undefined) => 
              oldData?.filter(offer => offer.id !== payload.old.id) ?? []
            );
          } else if (payload.new && 'status' in payload.new) {
            const updatedOffer = payload.new as TimeTransaction;
            if (updatedOffer.status === 'in_progress') {
              setAcceptedOffers(prev => new Set([...prev, updatedOffer.id]));
            }
            queryClient.invalidateQueries({ queryKey: ['offers'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDelete = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .delete()
        .eq('id', offerId)
        .eq('user_id', currentUserId)
        .eq('status', 'open');

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['offers'] });

      toast({
        title: "Success",
        description: "Offer deleted successfully",
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

  const handleConfirmOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ status: 'accepted' })
        .eq('id', offerId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer confirmed successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['offers'] });
    } catch (error) {
      console.error('Error confirming offer:', error);
      toast({
        title: "Error",
        description: "Failed to confirm offer",
        variant: "destructive",
      });
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ status: 'declined' })
        .eq('id', offerId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer rejected successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['offers'] });
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast({
        title: "Error",
        description: "Failed to reject offer",
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
                    {currentUserId === offer.user_id && offer.status === 'open' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(offer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{offer.description}</p>
                
                {/* Accept Offer Button - Only shown to non-creators when offer is open */}
                {currentUserId !== offer.user_id && offer.status === 'open' && (
                  <Button 
                    className="mt-4"
                    onClick={() => handleAcceptClick(offer)}
                    disabled={acceptedOffers.has(offer.id)}
                  >
                    {acceptedOffers.has(offer.id) ? 'Pending Offer' : 'Accept Offer'}
                  </Button>
                )}

                {/* Confirmation Buttons - Only shown to offer creator when status is in_progress */}
                {currentUserId === offer.user_id && offer.status === 'in_progress' && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => handleConfirmOffer(offer.id)}
                      className="bg-green-500 hover:bg-green-600"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-1" /> Confirm
                    </Button>
                    <Button
                      onClick={() => handleRejectOffer(offer.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
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