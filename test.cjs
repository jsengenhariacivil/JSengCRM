const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vdgenpcwmrefiijcfoid.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZ2VucGN3bXJlZmlpamNmb2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjYyODEsImV4cCI6MjA1NTk0MjI4MX0.N2vD-h3hWv2x_B3rN_A-_K8yW8-L8m2C_I3Y-e2_Hk0');
async function test() {
  const {data, error} = await supabase.from('clients').insert([{name: 'Test Client', type: 'Pessoa Física'}]).select();
  console.log(error || data);
}
test();
