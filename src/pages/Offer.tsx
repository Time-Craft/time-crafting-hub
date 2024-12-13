import { useState } from "react";
import { Handshake, Clock, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";

const Offer = () => {
  const [serviceType, setServiceType] = useState("");

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gardening">Gardening</SelectItem>
                  <SelectItem value="tutoring">Tutoring</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe the service you're offering..." className="resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Duration (hours)
                </label>
                <Input type="number" min="1" placeholder="2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </label>
                <Input placeholder="Your location" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Availability
              </label>
              <Input type="date" />
            </div>

            <Button className="w-full">
              <Handshake className="mr-2" />
              Create Offer
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Offer;
