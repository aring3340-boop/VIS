/* Supabase project settings. The anon key is public; database access is enforced by RLS. */
const SUPABASE_CONFIG={
  url:'https://VIS-institute.suly.co',
  anonKey:'sb_publishable_6dQazi7-Uoh7kHuar2X3Gw_oWD_-nW6'
};
function supabaseConfigured(){
  return SUPABASE_CONFIG.url.startsWith('https://')
    &&!SUPABASE_CONFIG.url.includes('PASTE')
    &&!SUPABASE_CONFIG.anonKey.includes('PASTE');
}
