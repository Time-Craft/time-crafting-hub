import { useState } from "react";
import { MapPin, Trees, Book, Filter, List, Map as MapIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";

const Explore = () => {
  const [view, setView] = useState<"list" | "map">("list"); // Changed default to "list"
  const [range, setRange] = useState<number>(5);

  const services = [
    { id: 1, name: "Gardening", icon: Trees, distance: "2.1 km", location: { lat: 37.7749, lng: -122.4194 } },
    { id: 2, name: "Tutoring", icon: Book, distance: "3.4 km", location: { lat: 37.7848, lng: -122.4294 } },
  ];

  const MapView = () => (
    <div className="relative bg-secondary rounded-lg overflow-hidden h-[60vh]">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-light/20 to-transparent">
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Service Locations</h3>
              <MapPin className="text-primary h-5 w-5" />
            </div>
            <div className="space-y-3">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="p-3 bg-secondary rounded-md hover:bg-primary-light/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <service.icon className="text-primary h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-gray-600">{service.distance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Interactive map integration coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Explore</h1>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setView(view === "map" ? "list" : "map")}
          >
            {view === "map" ? (
              <>
                <List className="h-4 w-4" /> List View
              </>
            ) : (
              <>
                <MapIcon className="h-4 w-4" /> Map View
              </>
            )}
          </Button>
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
            <MapView />
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {services.map((service) => (
                  <div 
                    key={service.id} 
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-light rounded-full">
                        <service.icon className="text-primary h-5 w-5" />
                      </div>
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