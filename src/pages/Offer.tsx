import { Handshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { OfferForm } from "@/components/offer/OfferForm";
import { OfferList } from "@/components/offer/OfferList";
import { useQueryClient } from "@tanstack/react-query";

const Offer = () => {
  const queryClient = useQueryClient();

  const handleOfferCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['offers'] });
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
          <CardContent>
            <OfferForm onOfferCreated={handleOfferCreated} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Offered Services</CardTitle>
          </CardHeader>
          <CardContent>
            <OfferList />
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Offer;