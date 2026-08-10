import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase enviroment variable (URL/Anon Key) are missing in .env.local");
    
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);