import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Payment = {
  id: string;
  reference_id: string;
  amount: number | null;
  sender: string | null;
  status: 'pending' | 'received' | 'verified';
  sms_content: string | null;
  created_at: string;
  updated_at: string;
};

export type SmsLog = {
  id: string;
  sender: string;
  content: string;
  received_at: string;
  payment_id: string | null;
  forwarded: boolean;
  created_at: string;
};
