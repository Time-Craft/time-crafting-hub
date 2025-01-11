import { useState, useEffect } from "react";
import { MapPin, Filter } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { SearchBar } from "@/components/explore/SearchBar";
import { UserList } from "@/components/explore/UserList";
import { OfferList } from "@/components/explore/OfferList";
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

  // Fetch available offers with user details, excluding current user's offers
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
        .neq('user_id', session.user.id) // Filter out current user's offers
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

  // Handle accepting an offer
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

    const { error } = await supabase
      .from('time_transactions')
      .update({ 
        recipient_id: session.user.id,
        status: 'in_progress'
      })
      .eq('id', offer.id);

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
      description: "Offer accepted successfully",
    });

    refetchOffers();
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Explore</h1>
          <Toggle 
            aria-label="Toggle view" 
            onClick={() => setView(view === "map" ? "list" : "map")}
          >
            {view === "map" ? "List View" : "Map View"}
          </Toggle>
        </div>
        
        <div className="space-y-4">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearchFocused={setIsSearchFocused}
          />
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>Within {range} km</span>
            <button className="ml-auto flex items-center gap-1">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {isSearchFocused && searchQuery ? (
        <UserList profiles={filteredProfiles} />
      ) : (
        view === "map" ? (
          <div className="bg-gray-100 h-[60vh] rounded-lg flex items-center justify-center">
            Interactive Map View (Coming Soon)
          </div>
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
