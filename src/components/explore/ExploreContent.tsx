import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { MapView } from "./MapView";
import { OfferList } from "./OfferList";
import { UserList } from "./UserList";
import type { Profile } from "@/types/explore";

interface ExploreContentProps {
  view: "map" | "list";
  isSearchFocused: boolean;
  searchQuery: string;
  filteredProfiles: Profile[] | null;
  offers: any;
  currentUserId: string | undefined;
  onAcceptOffer: any;
}

export const ExploreContent = ({
  view,
  isSearchFocused,
  searchQuery,
  filteredProfiles,
  offers,
  currentUserId,
  onAcceptOffer,
}: ExploreContentProps) => {
  return (
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
              currentUserId={currentUserId}
              onAcceptOffer={onAcceptOffer}
            />
          )}
        </div>
      )}
    </div>
  );
};