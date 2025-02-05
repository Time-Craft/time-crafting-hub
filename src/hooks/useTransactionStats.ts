import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useTransactionStats = () => {
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data: transactions, error } = await supabase
        .from('time_transactions')
        .select('*')
        .or(`user_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`);

      if (error) {
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('session_not_found')) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
          return null;
        }
        throw error;
      }

      return {
        activeServices: transactions?.filter(t => t.status === 'in_progress').length || 0,
        upcomingSessions: transactions?.filter(t => t.status === 'accepted' && !t.completed_at).length || 0,
        completedExchanges: transactions?.filter(t => 
          t.status === 'accepted' && t.completed_at
        ).length || 0,
        earnedHours: transactions
          ?.filter(t => 
            t.type === 'earned' && 
            t.status === 'accepted' && 
            t.completed_at && 
            t.user_id === session.user.id
          )
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        spentHours: transactions
          ?.filter(t => 
            t.type === 'spent' && 
            t.status === 'accepted' && 
            t.completed_at && 
            t.user_id === session.user.id
          )
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
      };
    },
    enabled: !!session?.user?.id
  });
};