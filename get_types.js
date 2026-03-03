import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wakzdfeqyidjrdxcgtdy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3pkZmVxeWlkanJkeGNndGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDUzOTQsImV4cCI6MjA4NTQ4MTM5NH0.NRrXNTZWrINU5tN1GGXijWC4UMbkOkB86G1WqW6SuBg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('team_members').select('type');
    if (error) {
        console.error('Error:', error);
        return;
    }

    const types = new Set(data.map(d => d.type));
    console.log('Existing types:', Array.from(types));
}

run();
