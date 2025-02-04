import type { TimeTransaction } from "@/types/explore";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfferStatusProps {
  offer: TimeTransaction;
  currentUserId: string | undefined;
}

export const OfferStatus = ({ offer, currentUserId }: OfferStatusProps) => {
  const getStatusConfig = () => {
    switch (offer.status) {
      case 'in_progress':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          message: currentUserId === offer.user_id 
            ? 'Someone has accepted your offer. Please confirm or decline.'
            : currentUserId === offer.recipient_id
            ? 'Waiting for the offer creator to confirm'
            : 'This offer is currently being processed'
        };
      case 'accepted':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          message: 'This offer has been accepted and confirmed'
        };
      case 'declined':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          message: 'This offer has been declined'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const { icon: Icon, color, message } = config;

  return (
    <div className={cn("mt-4 flex items-center gap-2 text-sm font-medium", color)}>
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};