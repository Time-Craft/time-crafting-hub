import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { UserList } from "@/components/explore/UserList";
import { OfferList } from "@/components/explore/OfferList";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { MapView } from "@/components/explore/MapView";
import type { Profile, TimeTransaction } from "@/types/explore";

const Explore = () => {
  const [view, setView] = useState<"map" | "list">("list");
  const [range, setRange] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  // Fetch all profiles
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Fetch available offers with user details
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

  // Filter profiles based on search query
  const filteredProfiles = profiles?.filter(profile => 
    profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.services?.some(service => 
      service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAcceptOffer = async (offer: TimeTransaction) => {
    if (!session?.user.id) {
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

    try {
      const { error } = await supabase
        .from('time_transactions')
        .update({ 
          recipient_id: session.user.id,
          status: 'in_progress'
        })
        .eq('id', offer.id)
        .eq('status', 'open');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to accept offer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Offer accepted successfully. Waiting for confirmation.",
      });

      refetchOffers();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <ExploreHeader
        view={view}
        setView={setView}
        range={range}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsSearchFocused={setIsSearchFocused}
      />

      {isSearchFocused && searchQuery ? (
        <UserList profiles={filteredProfiles} />
      ) : (
        view === "map" ? (
          <MapView />
        ) : (
          <OfferList 
            offers={offers}
            currentUserId={session?.user.id}
            onAcceptOffer={handleAcceptOffer}
          />
        )
      )}

      <BottomNav />
    </div>
  );
};

export default Explore;