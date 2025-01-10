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
  description: string;
  service_type: string;
  created_at: string;
  recipient_id: string | null;
  status: 'open' | 'in_progress' | 'accepted' | 'declined';
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}