import { LogOut, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

  const handleLogout = async () => {
    try {
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
    } finally {
      // Always navigate to login page and call the parent's onLogout
      // regardless of whether the signOut was successful
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