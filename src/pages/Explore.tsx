import { useState } from "react";
import { MapPin, Trees, Book, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";

const Explore = () => {
  const [view, setView] = useState<"map" | "list">("map");
  const [range, setRange] = useState<number>(5);

  const services = [
    { id: 1, name: "Gardening", icon: Trees, distance: "2.1 km" },
    { id: 2, name: "Tutoring", icon: Book, distance: "3.4 km" },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Explore</h1>
          <Toggle aria-label="Toggle view" onClick={() => setView(view === "map" ? "list" : "map")}>
            {view === "map" ? "List View" : "Map View"}
          </Toggle>
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

      <Tabs defaultValue="offering" className="w-full">
        <TabsList className="w-full justify-start p-2 bg-secondary">
          <TabsTrigger value="offering">Offering</TabsTrigger>
          <TabsTrigger value="seeking">Seeking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="offering" className="p-4">
          {view === "map" ? (
            <div className="bg-gray-100 h-[60vh] rounded-lg flex items-center justify-center">
              Interactive Map View (Coming Soon)
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <service.icon className="text-primary" />
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.distance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        <TabsContent value="seeking" className="p-4">
          <div className="text-center text-gray-500">
            No seeking requests found in your area
          </div>
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default Explore;