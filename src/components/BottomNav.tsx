import { Home, MapPin, Trophy, Plus, UserCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <Link to="/" className={`flex flex-col items-center ${isActive("/") ? "text-primary" : "text-gray-500"}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/explore" className={`flex flex-col items-center ${isActive("/explore") ? "text-primary" : "text-gray-500"}`}>
          <MapPin size={24} />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        <Link to="/offer" className="flex flex-col items-center">
          <div className="bg-primary rounded-full p-3 -mt-8">
            <Plus size={24} className="text-white" />
          </div>
          <span className="text-xs mt-1 text-gray-500">Offer</span>
        </Link>
        <Link to="/challenges" className={`flex flex-col items-center ${isActive("/challenges") ? "text-primary" : "text-gray-500"}`}>
          <Trophy size={24} />
          <span className="text-xs mt-1">Challenges</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${isActive("/profile") ? "text-primary" : "text-gray-500"}`}>
          <UserCircle size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;