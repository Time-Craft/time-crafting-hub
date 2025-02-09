
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import type { TimeTransaction } from "@/types/explore";
import { useTimeBalance } from "./useTimeBalance";
import { useExploreRealtime } from "./useExploreRealtime";
import { useAcceptOffer } from "./useAcceptOffer";

export const useExploreOffers = () => {
  const session = useSession();
  const { timeBalance, refetchBalance } = useTimeBalance(session?.user?.id);

  const { data: offers, refetch: refetchOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('time_transactions')
        .select(`
          *,
          profiles!fk_user_profile (
            username,
            avatar_url
          ),
          recipient:profiles!fk_recipient_profile (
            username,
            avatar_url
          )
        `)
        .eq('type', 'earned')
        .eq('status', 'open')
        .neq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TimeTransaction[];
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5
  });

  // Setup realtime subscriptions
  useExploreRealtime(session?.user?.id, refetchOffers, refetchBalance);

  // Setup offer acceptance handler
  const { handleAcceptOffer } = useAcceptOffer(
    session?.user?.id,
    timeBalance,
    refetchOffers,
    refetchBalance
  );

  return {
    offers,
    refetchOffers,
    handleAcceptOffer,
  };
};
