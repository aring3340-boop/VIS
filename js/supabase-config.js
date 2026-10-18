/* Supabase project settings. The anon key is public; database access is enforced by RLS. */
const SUPABASE_CONFIG={
  url:'https://PASTE_YOUR_PROJECT_REF.supabase.co',
  anonKey:'PASTE_YOUR_SUPABASE_ANON_KEY'
};
function supabaseConfigured(){
  return SUPABASE_CONFIG.url.startsWith('https://')
    &&!SUPABASE_CONFIG.url.includes('PASTE')
    &&!SUPABASE_CONFIG.anonKey.includes('PASTE');
}
