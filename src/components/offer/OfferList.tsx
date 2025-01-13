import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Offer {
  id: string;
  service_type: string;
  description: string;
  amount: number;
  created_at: string;
  status: string;
}

export const OfferList = () => {
  const session = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: offers, refetch } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('time_transactions')
          .select('*')
          .eq('user_id', session?.user.id)
          .eq('type', 'earned')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            navigate('/login');
            toast({
              title: "Session Expired",
              description: "Please sign in again",
              variant: "destructive",
            });
            return [];
          }
          throw error;
        }
        return data as Offer[];
      } catch (error) {
        console.error('Error fetching offers:', error);
        return [];
      }
    },
    enabled: !!session?.user.id,
  });

  useEffect(() => {
    if (!session?.user.id) return;

    const channel = supabase
      .channel(`time_transactions_${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          if (payload.eventType === 'DELETE') {
            // Optimistically update the cache
            queryClient.setQueryData(['offers'], (oldData: Offer[] | undefined) => 
              oldData?.filter(offer => offer.id !== payload.old.id) ?? []
            );
          } else {
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user.id, refetch, queryClient]);

  const handleDelete = async (offerId: string) => {
    if (!session?.user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete offers",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistically update the UI
      queryClient.setQueryData(['offers'], (oldData: Offer[] | undefined) => 
        oldData?.filter(offer => offer.id !== offerId) ?? []
      );

      const { error } = await supabase
        .from('time_transactions')
        .delete()
        .eq('id', offerId)
        .eq('user_id', session.user.id)
        .eq('status', 'open');

      if (error) {
        if (error.message.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          navigate('/login');
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      // Revert optimistic update on error
      refetch();
      toast({
        title: "Error",
        description: "Failed to delete offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!offers?.length) return null;

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="border rounded-lg p-4 space-y-2 relative bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold capitalize">{offer.service_type}</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {new Date(offer.created_at).toLocaleDateString()}
              </span>
              {offer.status === 'open' && (
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete offer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">{offer.description}</p>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">{offer.amount} hours</span>
            <span className={`capitalize ${
              offer.status === 'open' 
                ? 'text-green-600' 
                : offer.status === 'in_progress' 
                ? 'text-yellow-600'
                : offer.status === 'accepted'
                ? 'text-blue-600'
                : 'text-red-600'
            }`}>
              {offer.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};