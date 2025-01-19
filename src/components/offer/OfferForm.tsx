import { useState } from "react";
import { Handshake, Clock, Calendar, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const validateForm = () => {
    const finalServiceType = serviceType === "other" ? customService : serviceType;
    
    if (!finalServiceType) {
      setError("Please select a service type");
      return false;
    }
    if (!description) {
      setError("Please provide a description of your service");
      return false;
    }
    if (!duration || Number(duration) <= 0) {
      setError("Please enter a valid duration (greater than 0)");
      return false;
    }
    if (!location) {
      setError("Please provide a location");
      return false;
    }
    if (!date) {
      setError("Please select an availability date");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create an offer.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    const finalServiceType = serviceType === "other" ? customService : serviceType;
    
    try {
      const { error: transactionError } = await supabase
        .from('time_transactions')
        .insert({
          user_id: session.user.id,
          type: 'earned',
          amount: Number(duration),
          description,
          service_type: finalServiceType,
          status: 'open',
        });

      if (transactionError) throw transactionError;

      // Reset form
      setServiceType("");
      setCustomService("");
      setDescription("");
      setDuration("");
      setLocation("");
      setDate("");
      setError(null);

      toast({
        title: "Success!",
        description: "Your service offer has been created.",
      });

      onOfferCreated();
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create the offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            min="0.5"
            step="0.5"
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
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Handshake className="mr-2" />
        {isSubmitting ? "Creating Offer..." : "Create Offer"}
      </Button>
    </form>
  );
};