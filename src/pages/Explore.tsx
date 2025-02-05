import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { ExploreContent } from "@/components/explore/ExploreContent";
import { useExploreOffers } from "@/hooks/useExploreOffers";
import type { Profile } from "@/types/explore";

const Explore = () => {
  const [view, setView] = useState<"map" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const session = useSession();
  const { offers, handleAcceptOffer, refetchOffers } = useExploreOffers();

  // Fetch all profiles with optimized query
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });
      
      if (!error) {
        setProfiles(data as Profile[]);
      }
    };
    fetchProfiles();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <ExploreHeader
          view={view}
          setView={setView}
          range={5}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsSearchFocused={setIsSearchFocused}
        />
        
        <ExploreContent
          view={view}
          isSearchFocused={isSearchFocused}
          searchQuery={searchQuery}
          filteredProfiles={filteredProfiles}
          offers={offers}
          currentUserId={session?.user?.id}
          onAcceptOffer={handleAcceptOffer}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default Explore;