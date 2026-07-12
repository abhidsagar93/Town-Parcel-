/* ============================================================
   Town Parcel Admin — Supabase Client
   Shared across every /admin page.
   ============================================================ */
const SUPABASE_URL = "https://genpfrinwaivgpkzaayu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbnBmcmlud2Fpdmdwa3phYXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Nzg2ODcsImV4cCI6MjA5OTI1NDY4N30.XPHlBEY6CoN6BWrv_7zfu2K3ebLO0PZs3yLEYB8jDk4";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
