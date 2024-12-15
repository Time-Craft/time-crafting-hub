import { useState, useEffect } from "react";
import { Handshake, Clock, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import BottomNav from "@/components/BottomNav";

interface Offer {
  serviceType: string;
  description: string;
  duration: string;
  location: string;
  date: string;
}

const Offer = () => {
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedOffers = localStorage.getItem('offers');
    if (storedOffers) {
      setOffers(JSON.parse(storedOffers));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any field is empty
    if (!serviceType || !description || !duration || !location || !date) {
      toast({
        title: "Error",
        description: "Please fill in all fields before creating an offer.",
        variant: "destructive",
      });
      return;
    }

    const newOffer = {
      serviceType,
      description,
      duration,
      location,
      date
    };

    const updatedOffers = [...offers, newOffer];
    setOffers(updatedOffers);
    localStorage.setItem('offers', JSON.stringify(updatedOffers));

    // Reset form
    setServiceType("");
    setDescription("");
    setDuration("");
    setLocation("");
    setDate("");

    toast({
      title: "Success!",
      description: "Your service offer has been created.",
    });
  };

  return (
    <div className="min-h-screen pb-20 p-4 bg-secondary/30">
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="text-primary" />
              Offer Your Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <Select value={serviceType} onValueChange={setServiceType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gardening">Gardening</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="pet-care">Pet Care</SelectItem>
                    <SelectItem value="elderly-care">Elderly Care</SelectItem>
                    <SelectItem value="cooking">Cooking</SelectItem>
                    <SelectItem value="handyman">Handyman</SelectItem>
                    <SelectItem value="tech-support">Tech Support</SelectItem>
                    <SelectItem value="language-exchange">Language Exchange</SelectItem>
                    <SelectItem value="music-lessons">Music Lessons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Describe the service you're offering..." 
                  className="resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Duration (hours)
                  </label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="2"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location
                  </label>
                  <Input 
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Availability
                </label>
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Handshake className="mr-2" />
                Create Offer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List of Offers */}
        {offers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Offered Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.map((offer, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold capitalize">{offer.serviceType}</h3>
                      <span className="text-sm text-gray-500">{offer.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{offer.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{offer.duration} hours</span>
                      <span>•</span>
                      <span>{offer.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Offer;