import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  return (
    <div className="min-h-screen pb-20">
      <ProfileHeader />
      <ProfileTabs />
      <BottomNav />
    </div>
  );
};

export default Profile;