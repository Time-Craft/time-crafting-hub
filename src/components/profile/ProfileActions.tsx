import { LogOut, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onLogout: () => void;
}

export const ProfileActions = ({ 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  onLogout: propOnLogout 
}: ProfileActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // If we get a session error, we should still redirect to login
        // as the session is invalid anyway
        if (error.message.includes('session_not_found') || 
            error.status === 403) {
          console.log('Session already expired, redirecting to login');
          navigate('/login', { replace: true });
          if (propOnLogout) {
            propOnLogout();
          }
          return;
        }
        
        // For other errors, show a toast
        console.error('Logout error:', error);
        toast({
          title: "Error logging out",
          description: "Please try again",
          variant: "destructive",
        });
        return;
      }

      // Successful logout
      navigate('/login', { replace: true });
      if (propOnLogout) {
        propOnLogout();
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
      // Even if there's an error, redirect to login
      // as it's better to force a re-login than leave the user in a potentially invalid state
      navigate('/login', { replace: true });
      if (propOnLogout) {
        propOnLogout();
      }
    }
  };

  return (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <button onClick={onSave} className="text-green-500">
            <Save size={20} />
          </button>
          <button onClick={onCancel} className="text-red-500">
            <X size={20} />
          </button>
        </>
      ) : (
        <>
          <button onClick={onEdit} className="text-primary">
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
  );
};