import { useState, useEffect } from "react";
import { MapPin, Filter, Search, User2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

interface Profile {
  id: string;
  username: string;
  services: string[];
  avatar_url: string | null;
}

interface TimeTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string | null;
  service_type: string;
  created_at: string;
  recipient_id: string | null;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

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
      const { data, error } = await supabase
        .from('time_transactions')
        .select(`
          *,
          profiles!time_transactions_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('type', 'earned')
        .is('recipient_id', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TimeTransaction[];
    }
  });

  // Set up real-time subscription
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
      .update({ recipient_id: session.user.id })
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users or services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
          </div>
          
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
        <ScrollArea className="h-[calc(100vh-200px)] p-4">
          {filteredProfiles?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No users found matching your search
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProfiles?.map((profile) => (
                <div key={profile.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>
                        <User2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{profile.username || 'Anonymous'}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.services?.map((service, index) => (
                          <Badge key={index} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)] p-4">
          {view === "map" ? (
            <div className="bg-gray-100 h-[60vh] rounded-lg flex items-center justify-center">
              Interactive Map View (Coming Soon)
            </div>
          ) : (
            <div className="space-y-4">
              {offers?.map((offer) => (
                <Card key={offer.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={offer.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        <User2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{offer.profiles.username || 'Anonymous'}</h3>
                          <p className="text-sm text-gray-500">{offer.service_type}</p>
                        </div>
                        <Badge>{offer.amount} hours</Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{offer.description}</p>
                      {session?.user.id !== offer.user_id && (
                        <Button 
                          className="mt-4"
                          onClick={() => handleAcceptOffer(offer)}
                        >
                          Accept Offer
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      <BottomNav />
    </div>
  );
};

export default Explore;