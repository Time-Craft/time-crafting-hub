import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageProps {
  username: string;
  avatarUrl: string | null;
  userId: string;
  onImageUpdate: (url: string | null) => void;
}

export const ProfileImage = ({ username, avatarUrl, userId, onImageUpdate }: ProfileImageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // If there's an existing image, delete it first
      if (avatarUrl) {
        const oldFilePath = avatarUrl.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('profile_images')
            .remove([oldFilePath]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      onImageUpdate(publicUrl);
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-16 w-16">
        <AvatarImage src={avatarUrl || "/placeholder.svg"} />
        <AvatarFallback>{username?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-1 -right-1">
        <label 
          className="p-1 bg-primary rounded-full cursor-pointer hover:bg-primary-dark transition-colors"
          htmlFor="profile-image"
        >
          <Camera className="h-4 w-4 text-white" />
          <input
            type="file"
            id="profile-image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};