import type { TimeTransaction } from "@/types/explore";

interface OfferStatusProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
}

export const OfferStatus = ({ offer, currentUserId }: OfferStatusProps) => {
  if (offer.status === 'in_progress') {
    return (
      <p className="mt-4 text-sm text-yellow-600 font-medium">
        {currentUserId === offer.user_id 
          ? 'Someone has accepted your offer. Please confirm or decline.'
          : 'Waiting for confirmation from the offer creator'}
      </p>
    );
  }

  if (offer.status === 'accepted') {
    return (
      <p className="mt-4 text-sm text-green-600 font-medium">
        This offer has been accepted and confirmed
      </p>
    );
  }

  if (offer.status === 'declined') {
    return (
      <p className="mt-4 text-sm text-red-600 font-medium">
        This offer has been declined
      </p>
    );
  }

  return null;
};