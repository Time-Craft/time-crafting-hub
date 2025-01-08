import { LogOut, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onLogout 
}: ProfileActionsProps) => {
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
            onClick={onLogout}
            className="text-red-500"
          >
            <LogOut size={20} />
          </Button>
        </>
      )}
    </div>
  );
};