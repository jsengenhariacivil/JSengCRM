import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wakzdfeqyidjrdxcgtdy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3pkZmVxeWlkanJkeGNndGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDUzOTQsImV4cCI6MjA4NTQ4MTM5NH0.NRrXNTZWrINU5tN1GGXijWC4UMbkOkB86G1WqW6SuBg';

async function run() {
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
        const spec = await res.json();
        const teamMembersDef = spec.definitions.team_members;
        console.log(JSON.stringify(teamMembersDef.properties.type, null, 2));
    } catch (err) {
        console.error(err);
    }
}

run();
