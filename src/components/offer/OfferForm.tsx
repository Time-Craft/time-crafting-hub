import { useState } from "react";
import { Handshake, Clock, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface OfferFormProps {
  onOfferCreated: () => void;
}

export const OfferForm = ({ onOfferCreated }: OfferFormProps) => {
  const [serviceType, setServiceType] = useState("");
  const [customService, setCustomService] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const { toast } = useToast();
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalServiceType = serviceType === "other" ? customService : serviceType;
    
    if (!finalServiceType || !description || !duration || !location || !date) {
      toast({
        title: "Error",
        description: "Please fill in all fields before creating an offer.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a time transaction for the offer
      const { error: transactionError } = await supabase
        .from('time_transactions')
        .insert({
          user_id: session?.user.id,
          type: 'earned',
          amount: Number(duration),
          description,
          service_type: finalServiceType,
        });

      if (transactionError) throw transactionError;

      // Reset form
      setServiceType("");
      setCustomService("");
      setDescription("");
      setDuration("");
      setLocation("");
      setDate("");

      toast({
        title: "Success!",
        description: "Your service offer has been created and time credits added.",
      });

      onOfferCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the offer. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating offer:', error);
    }
  };

  return (
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
            <SelectItem value="fitness-training">Fitness Training</SelectItem>
            <SelectItem value="art-lessons">Art Lessons</SelectItem>
            <SelectItem value="child-care">Child Care</SelectItem>
            <SelectItem value="event-planning">Event Planning</SelectItem>
            <SelectItem value="other">Other (Specify)</SelectItem>
          </SelectContent>
        </Select>
        {serviceType === "other" && (
          <Input
            placeholder="Enter your service type"
            value={customService}
            onChange={(e) => setCustomService(e.target.value)}
            required
            className="mt-2"
          />
        )}
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
  );
};