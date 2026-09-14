export interface WatchRecord {
  id: string;
  brand: string;
  model: string;
  reference: string | null;
  price_estimate: string;
  specs: string;
  store_name: string | null;
  store_url: string | null;
  created_at: string;
  images?: WatchImageRecord[];
  tags?: string[];
  specifications?: Record<string,string>;
}

export interface WatchImageRecord {
  id: string;
  watch_id: string;
  image_url: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface UserRankingRecord {
  id: string;
  user_id: string;
  watch_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  watch?: WatchRecord;
}

export interface UserCollectionRecord {
  id: string;
  user_id: string;
  watch_id: string;
  acquired_at: string | null;
  created_at: string;
  watch?: WatchRecord;
}

export interface Database {
  public: {
    Tables: {
      watches: {
        Row: WatchRecord;
        Insert: Omit<WatchRecord, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<WatchRecord, 'id' | 'created_at'>>;
      };
      watch_images: {
        Row: WatchImageRecord;
        Insert: Omit<WatchImageRecord, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<WatchImageRecord, 'id' | 'created_at'>>;
      };
      user_rankings: {
        Row: UserRankingRecord;
        Insert: Omit<UserRankingRecord, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<UserRankingRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_collections: {
        Row: UserCollectionRecord;
        Insert: Omit<UserCollectionRecord, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<UserCollectionRecord, 'id' | 'created_at'>>;
      };
    };
  };
}
