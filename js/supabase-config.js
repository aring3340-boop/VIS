/* Supabase project settings. The anon key is public; database access is enforced by RLS. */
const SUPABASE_CONFIG={
  url:'https://gwypqxdgubkzhuzpldvm.supabase.co',
  anonKey:'sb_publishable_Y4Gmcdxo6Qg29uXTCnfwlA_aZmzwmOV'
};
function supabaseConfigured(){
  return SUPABASE_CONFIG.url.startsWith('https://')
    &&!SUPABASE_CONFIG.url.includes('PASTE')
    &&!SUPABASE_CONFIG.anonKey.includes('PASTE');
}
