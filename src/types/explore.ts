
export interface Profile {
  id: string;
  username: string | null;
  services: string[];
  avatar_url: string | null;
}

export interface TimeTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string | null;
  service_type: string;
  created_at: string;
  recipient_id: string | null;
  status: 'open' | 'in_progress' | 'accepted' | 'declined';
  completed_at: string | null;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  recipient?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export interface OfferInteraction {
  id: string;
  user_id: string;
  offer_id: string;
  created_at: string;
}
