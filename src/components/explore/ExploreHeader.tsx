import { MapPin, Filter } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { SearchBar } from "./SearchBar";

interface ExploreHeaderProps {
  view: "map" | "list";
  setView: (view: "map" | "list") => void;
  range: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearchFocused: (focused: boolean) => void;
}

export const ExploreHeader = ({
  view,
  setView,
  range,
  searchQuery,
  setSearchQuery,
  setIsSearchFocused,
}: ExploreHeaderProps) => {
  return (
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
  );
};