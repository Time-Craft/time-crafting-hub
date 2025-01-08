import { useState, useEffect } from "react";
import { UserCheck, Edit, Save, X, LogOut, Star, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ProfileHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedServices, setEditedServices] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);

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
      .select('username, services')
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

  const visibleServices = services.slice(0, 5);
  const hasMoreServices = services.length > 5;

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
                placeholder="Services (comma-separated)"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{username}</h1>
                <UserCheck className="text-primary" size={20} />
              </div>
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                {visibleServices.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
                {hasMoreServices && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setShowAllServices(true)}
                  >
                    <Eye size={16} />
                    Show All
                  </Button>
                )}
              </div>
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

      <Dialog open={showAllServices} onOpenChange={setShowAllServices}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>All Services</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-2 p-4">
              {services.map((service, index) => (
                <Badge key={index} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};