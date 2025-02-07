
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingOfferCard } from "./pending-offers/PendingOfferCard";
import { usePendingOffers } from "@/hooks/usePendingOffers";

export const PendingOffers = () => {
  const {
    pendingOffers,
    isLoading,
    handleConfirmOffer,
    handleDeclineOffer,
  } = usePendingOffers();

  return (
    <section className="p-6">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Confirmations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-gray-500 text-center">Loading offers...</p>
              ) : !pendingOffers?.length ? (
                <p className="text-gray-500 text-center">No pending offers to confirm</p>
              ) : (
                pendingOffers?.map((offer) => (
                  <PendingOfferCard
                    key={offer.id}
                    offer={offer}
                    onConfirm={handleConfirmOffer}
                    onDecline={handleDeclineOffer}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
