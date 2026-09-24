

const SUPABASE_URL = "https://xwedruaazngeqjigtlsv.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZWRydWFhem5nZXFqaWd0bHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjczMzQsImV4cCI6MjEwNTgwMzMzNH0.xtebEBeJHMMSRk-OvIMRLEWN1jpmDCNWX11i58rQa0M";


const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const MAX_CREDITS = 25;
