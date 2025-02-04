import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { useSession } from "@supabase/auth-helpers-react";
import { UserList } from "@/components/explore/UserList";
import { OfferList } from "@/components/explore/OfferList";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { MapView } from "@/components/explore/MapView";
import type { Profile, TimeTransaction } from "@/types/explore";
import { useToast } from "@/hooks/use-toast";

const Explore = () => {
  const [view, setView] = useState<"map" | "list">("list");
  const [range, setRange] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  // Fetch all profiles with optimized query
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Fetch available offers with optimized query
  const { data: offers, refetch: refetchOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('time_transactions')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('type', 'earned')
        .neq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TimeTransaction[];
    },
    enabled: !!session?.user?.id
  });

  // Fetch user's time balance
  const { data: timeBalance } = useQuery({
    queryKey: ['timeBalance', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('time_balances')
        .select('balance')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Realtime subscription for offers
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
          refetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchOffers]);

  // Optimized profile filtering
  const filteredProfiles = profiles?.filter(profile => 
    profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.services?.some(service => 
      service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAcceptOffer = async (offer: TimeTransaction) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to accept offers",
        variant: "destructive",
      });
      return;
    }

    if (offer.user_id === session.user.id) {
      toast({
        title: "Error",
        description: "You cannot accept your own offer",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough balance
    if (!timeBalance || timeBalance.balance < offer.amount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${offer.amount} hours to accept this offer. Your balance: ${timeBalance?.balance || 0} hours`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({
          status: 'in_progress',
          recipient_id: session.user.id
        })
        .eq('id', offer.id)
        .eq('status', 'open');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer accepted successfully! The creator will be notified.",
      });

      refetchOffers();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <ExploreHeader
          view={view}
          setView={setView}
          range={range}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsSearchFocused={setIsSearchFocused}
        />

        <div className="px-4 pb-20">
          {isSearchFocused && searchQuery ? (
            <div className="mt-4">
              <UserList profiles={filteredProfiles} />
            </div>
          ) : (
            <div className="mt-4">
              {view === "map" ? (
                <MapView className="rounded-xl shadow-sm" />
              ) : (
                <OfferList 
                  offers={offers}
                  currentUserId={session?.user?.id}
                  onAcceptOffer={handleAcceptOffer}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Explore;