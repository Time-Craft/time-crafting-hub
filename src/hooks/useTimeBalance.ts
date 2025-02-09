
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTimeBalance = (userId: string | undefined) => {
  const { data: timeBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['timeBalance', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5
  });

  return {
    timeBalance,
    refetchBalance
  };
};
