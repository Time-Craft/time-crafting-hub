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
  searchQuery,
  setSearchQuery,
  setIsSearchFocused,
}: ExploreHeaderProps) => {
  return (
    <div className="bg-white border-b">
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Explore</h1>
          <Toggle 
            aria-label="Toggle view" 
            onClick={() => setView(view === "map" ? "list" : "map")}
            className="bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {view === "map" ? (
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" /> List View
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Map View
              </span>
            )}
          </Toggle>
        </div>
        
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsSearchFocused={setIsSearchFocused}
        />
      </div>
    </div>
  );
};