import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TimeTransaction } from '@/types/explore';

export const useOfferRealtime = (
  setAcceptedOffers: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
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
  }, [queryClient, setAcceptedOffers]);
};