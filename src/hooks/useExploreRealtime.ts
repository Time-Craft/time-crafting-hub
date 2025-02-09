
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { QueryClient } from "@tanstack/react-query";

export const useExploreRealtime = (
  userId: string | undefined,
  refetchOffers: () => void,
  refetchBalance: () => void
) => {
  useEffect(() => {
    if (!userId) return;

    const offersChannel = supabase
      .channel('public:time_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions',
        },
        () => {
          console.log('Received realtime update for transactions, refetching...');
          refetchOffers();
        }
      )
      .subscribe();

    const balancesChannel = supabase
      .channel('public:time_balances')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'time_balances',
          filter: `id=eq.${userId}`,
        },
        () => {
          console.log('Received realtime update for balance, refetching...');
          refetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(balancesChannel);
    };
  }, [userId, refetchOffers, refetchBalance]);
};
