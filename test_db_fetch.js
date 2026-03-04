const url = 'https://wakzdfeqyidjrdxcgtdy.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3pkZmVxeWlkanJkeGNndGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDUzOTQsImV4cCI6MjA4NTQ4MTM5NH0.NRrXNTZWrINU5tN1GGXijWC4UMbkOkB86G1WqW6SuBg';
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

async function run() {
    const r1 = await fetch(url + '/rest/v1/proposal_etapas?select=id&limit=1', { headers });
    console.log('proposal_etapas.status =', r1.status);
    if (!r1.ok) console.error(await r1.text());

    const r2 = await fetch(url + '/rest/v1/proposal_items?select=parent_id,etapa_id&limit=1', { headers });
    console.log('proposal_items columns.status =', r2.status);
    if (!r2.ok) console.error(await r2.text());
}
run();
