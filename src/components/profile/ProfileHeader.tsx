import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ProfileImage } from "./ProfileImage";
import { ProfileActions } from "./ProfileActions";
import { ServicesList } from "./ServicesList";

export const ProfileHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedServices, setEditedServices] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    setUserId(session.user.id);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, services, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (profile) {
      setUsername(profile.username || '');
      setEditedUsername(profile.username || '');
      setServices(profile.services || []);
      setEditedServices(profile.services?.join(', ') || '');
      setAvatarUrl(profile.avatar_url);
    }
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newServices = editedServices
      .split(',')
      .map(service => service.trim())
      .filter(service => service.length > 0);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        username: editedUsername,
        services: newServices
      })
      .eq('id', session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return;
    }

    setUsername(editedUsername);
    setServices(newServices);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
      return;
    }
    navigate('/login');
  };

  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <ProfileImage
            username={username}
            avatarUrl={avatarUrl}
            userId={userId}
            onImageUpdate={(url) => setAvatarUrl(url)}
          />
          {isEditing ? (
            <Input
              value={editedUsername}
              onChange={(e) => setEditedUsername(e.target.value)}
              placeholder="Username"
              className="max-w-[200px]"
            />
          ) : (
            <div>
              <h1 className="text-xl font-semibold">{username}</h1>
            </div>
          )}
        </div>
        <ProfileActions
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onLogout={handleLogout}
        />
      </div>

      <div className="mt-4">
        {isEditing ? (
          <Input
            value={editedServices}
            onChange={(e) => setEditedServices(e.target.value)}
            placeholder="Services (comma-separated)"
          />
        ) : (
          <ServicesList services={services} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-primary-light p-4">
          <p className="text-sm text-gray-600">Time Balance</p>
          <p className="text-xl font-semibold">24 hours</p>
        </div>
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-sm text-gray-600">Rating</p>
          <div className="flex items-center gap-1">
            <Star className="fill-primary text-primary" size={20} />
            <span className="text-xl font-semibold">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
