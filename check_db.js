import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdgenpcwmrefiijcfoid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZ2VucGN3bXJlZmlpamNmb2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDQ2OTQsImV4cCI6MjA5Nzk4MDY5NH0.KMqnswRWc2_nsl90Ik3Y6G5XtJX9HANMhbWJ76gKimI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log("Checking users table...");
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error("Error connecting to users table:", error.message);
  } else {
    console.log("Users table data:", data);
  }
}

checkConnection();
