import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimeTransaction } from "@/types/explore";
import { useQueryClient } from "@tanstack/react-query";

export const useOfferManagement = (currentUserId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    handleDelete,
    handleConfirmOffer,
    handleRejectOffer,
  };
};