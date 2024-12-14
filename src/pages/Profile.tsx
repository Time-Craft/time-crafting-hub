import { UserCheck, Clock, List, Star, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [services, setServices] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedServices = localStorage.getItem('userServices');
    
    if (!storedUsername) {
      navigate('/login');
      return;
    }

    setUsername(storedUsername);
    setServices(storedServices || '');
  }, [navigate]);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{username}</h1>
              <UserCheck className="text-primary" size={20} />
            </div>
            <p className="text-sm text-gray-600">{services}</p>
          </div>
          <button className="text-primary">
            <Edit size={20} />
          </button>
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

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full justify-start p-2 bg-secondary">
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="time">Time Logs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-350px)]">
          <TabsContent value="history" className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <List className="text-primary" size={20} />
                    <div>
                      <h3 className="font-medium">Gardening Service</h3>
                      <p className="text-sm text-gray-600">Completed on March {item}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="time" className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    <div>
                      <h3 className="font-medium">+2 hours earned</h3>
                      <p className="text-sm text-gray-600">Tutoring Service</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="fill-primary text-primary" size={20} />
                    <span className="font-medium">5.0</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Great service! Very professional and punctual."
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default Profile;