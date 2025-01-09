import { User2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/explore";

interface UserListProps {
  profiles: Profile[] | null;
}

export const UserList = ({ profiles }: UserListProps) => {
  if (!profiles?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No users found matching your search
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] p-4">
      <div className="space-y-4">
        {profiles.map((profile) => (
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
    </ScrollArea>
  );
};