export interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string | null;
  display_name: string | null;
  banner_url: string | null;
  country: string | null;
  views?: number | null; //  AJOUTÉ
  created_at: string;
}

export interface LinkItem {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string | null;
  display_order: number;
  clicks: number;
  is_active: boolean;
  created_at: string;
}