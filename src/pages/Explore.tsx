import { useState } from "react";
import { MapPin, Filter, Search, User2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

const Explore = () => {
  const [view, setView] = useState<"map" | "list">("list");
  const [range, setRange] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Filter profiles based on search query
  const filteredProfiles = profiles?.filter(profile => 
    profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.services?.some(service => 
      service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full justify-start p-2 bg-secondary">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="p-4">
          {view === "map" ? (
            <div className="bg-gray-100 h-[60vh] rounded-lg flex items-center justify-center">
              Interactive Map View (Coming Soon)
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              {isLoading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : filteredProfiles?.length === 0 ? (
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
          )}
        </TabsContent>
        
        <TabsContent value="services" className="p-4">
          <div className="text-center text-gray-500">
            Service-specific view coming soon
          </div>
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default Explore;