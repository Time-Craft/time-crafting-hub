import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Offer {
  id: string;
  service_type: string;
  description: string;
  amount: number;
  created_at: string;
}

export const OfferList = () => {
  const session = useSession();

  const { data: offers } = useQuery({
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

  if (!offers?.length) return null;

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold capitalize">{offer.service_type}</h3>
            <span className="text-sm text-gray-500">
              {new Date(offer.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">{offer.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{offer.amount} hours</span>
          </div>
        </div>
      ))}
    </div>
  );
};