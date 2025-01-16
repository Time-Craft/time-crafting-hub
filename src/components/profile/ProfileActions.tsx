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
      // First clear the local session
      await supabase.auth.clearSession();
      // Then attempt to logout
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always navigate to login page regardless of logout success/failure
      navigate('/login');
      // Call the parent's onLogout handler if provided
      propOnLogout();
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