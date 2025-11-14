import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Garden = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Plant = {
  id: string;
  garden_id: string;
  type: 'flower' | 'tree' | 'succulent' | 'mushroom';
  position_x: number;
  position_y: number;
  growth_stage: number;
  water_level: number;
  happiness: number;
  last_watered: string;
  last_visited: string;
  created_at: string;
};
