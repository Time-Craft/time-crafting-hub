import { UserCheck, Clock, List, Star, Edit, Save, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [services, setServices] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedServices, setEditedServices] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedServices = localStorage.getItem('userServices');
    
    if (!storedUsername) {
      navigate('/login');
      return;
    }

    setUsername(storedUsername);
    setServices(storedServices || '');
    setEditedUsername(storedUsername);
    setEditedServices(storedServices || '');
  }, [navigate]);

  const handleSave = () => {
    localStorage.setItem('username', editedUsername);
    localStorage.setItem('userServices', editedServices);
    setUsername(editedUsername);
    setServices(editedServices);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const serviceHistory = [
    {
      type: "Gardening Service",
      date: "March 15, 2024",
      client: "John Doe",
      duration: "2 hours",
      status: "Completed",
      rating: 5
    },
    {
      type: "Home Cleaning",
      date: "March 10, 2024",
      client: "Sarah Smith",
      duration: "3 hours",
      status: "Completed",
      rating: 4.5
    },
    {
      type: "Pet Sitting",
      date: "March 5, 2024",
      client: "Mike Johnson",
      duration: "4 hours",
      status: "Completed",
      rating: 5
    }
  ];

  const timeLogs = [
    {
      service: "Tutoring Service",
      date: "March 15, 2024",
      hoursEarned: 2,
      client: "Emma Wilson",
      notes: "Math tutoring session"
    },
    {
      service: "Elderly Care",
      date: "March 12, 2024",
      hoursEarned: 3,
      client: "Robert Brown",
      notes: "Afternoon care and companionship"
    },
    {
      service: "Tech Support",
      date: "March 8, 2024",
      hoursEarned: 1.5,
      client: "Lisa Anderson",
      notes: "Computer troubleshooting"
    }
  ];

  const reviews = [
    {
      rating: 5,
      comment: "Excellent service! Very professional and punctual. Would highly recommend!",
      from: "John Doe",
      date: "March 15, 2024",
      service: "Gardening"
    },
    {
      rating: 4.5,
      comment: "Great work ethic and very thorough with the cleaning. Will hire again!",
      from: "Sarah Smith",
      date: "March 10, 2024",
      service: "Home Cleaning"
    },
    {
      rating: 5,
      comment: "Amazing with pets! My dog loved the care and attention.",
      from: "Mike Johnson",
      date: "March 5, 2024",
      service: "Pet Sitting"
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
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
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-green-500">
                <Save size={20} />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-red-500">
                <X size={20} />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-primary">
              <Edit size={20} />
            </button>
          )}
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
              {serviceHistory.map((service, index) => (
                <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <List className="text-primary" size={20} />
                    <div className="flex-1">
                      <h3 className="font-medium">{service.type}</h3>
                      <p className="text-sm text-gray-600">
                        Client: {service.client} • Duration: {service.duration}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date: {service.date} • Rating: {service.rating}/5
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="time" className="p-4">
            <div className="space-y-4">
              {timeLogs.map((log, index) => (
                <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    <div className="flex-1">
                      <h3 className="font-medium">{log.service}</h3>
                      <p className="text-sm text-gray-600">
                        +{log.hoursEarned} hours earned • {log.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        Client: {log.client}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="p-4">
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="fill-primary text-primary" size={20} />
                    <span className="font-medium">{review.rating}</span>
                    <span className="text-sm text-gray-600">• {review.service}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    "{review.comment}"
                  </p>
                  <p className="text-sm text-gray-500">
                    {review.from} • {review.date}
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