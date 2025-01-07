import { useState, useEffect } from "react";
import { UserCheck, Edit, Save, X, LogOut, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const ProfileHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [services, setServices] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedServices, setEditedServices] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (profile) {
      setUsername(profile.username || '');
      setEditedUsername(profile.username || '');
    }

    // Get services from localStorage for now
    const storedServices = localStorage.getItem('userServices');
    setServices(storedServices || '');
    setEditedServices(storedServices || '');
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: editedUsername })
      .eq('id', session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('userServices', editedServices);
    setUsername(editedUsername);
    setServices(editedServices);
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
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>{username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                placeholder="Username"
              />
              <Input
                value={editedServices}
                onChange={(e) => setEditedServices(e.target.value)}
                placeholder="Services"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{username}</h1>
                <UserCheck className="text-primary" size={20} />
              </div>
              <p className="text-sm text-gray-600">{services}</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="text-green-500">
                <Save size={20} />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-red-500">
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="text-primary">
                <Edit size={20} />
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-red-500"
              >
                <LogOut size={20} />
              </Button>
            </>
          )}
        </div>
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