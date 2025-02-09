
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const session = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Listen for changes in time_transactions table where user is either creator or recipient
    const transactionsChannel = supabase
      .channel('db-time-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_transactions',
          filter: `or(user_id.eq.${session.user.id},recipient_id.eq.${session.user.id})`
        },
        (payload) => {
          console.log('Received transaction update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            const oldData = payload.old as any;

            // Notification for status changes
            if (newData.status !== oldData.status) {
              switch (newData.status) {
                case 'in_progress':
                  if (newData.user_id === session.user.id) {
                    toast({
                      title: "New Offer Request",
                      description: `Someone wants to accept your ${newData.service_type} offer for ${newData.amount} hours`,
                      variant: "default",
                    });
                  }
                  break;
                case 'accepted':
                  toast({
                    title: "Offer Accepted",
                    description: `Your ${newData.service_type} request was accepted`,
                    variant: "default",
                  });
                  break;
                case 'declined':
                  toast({
                    title: "Offer Declined",
                    description: `Your ${newData.service_type} request was declined`,
                    variant: "destructive",
                  });
                  break;
              }
            }
          }
        }
      )
      .subscribe();

    // Listen for changes in time_balances table
    const balancesChannel = supabase
      .channel('db-time-balances')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'time_balances',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Received balance update:', payload);
          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Only notify if balance has changed
          if (newData.balance !== oldData.balance) {
            const difference = newData.balance - oldData.balance;
            toast({
              title: "Balance Updated",
              description: `Your time balance has ${difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(difference)} hours`,
              variant: "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(balancesChannel);
    };
  }, [session?.user?.id]);
};
