import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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

  const { data: offers, refetch } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_transactions')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('type', 'earned')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Offer[];
    },
    enabled: !!session?.user.id,
  });

  // Subscribe to real-time changes
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
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleDelete = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('time_transactions')
        .delete()
        .eq('id', offerId)
        .eq('user_id', session?.user.id)
        .eq('status', 'open'); // Only allow deletion of open offers

      if (error) throw error;

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