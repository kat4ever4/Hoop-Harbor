import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.https://uxisjsmkprpkblevonps.supabase.co;
const supabaseKey = process.env.sb_publishable_eW9YSIZDPNhX7G7yNrws9g_W-NVEVjB;

export const supabase = createClient(supabaseUrl, supabaseKey);