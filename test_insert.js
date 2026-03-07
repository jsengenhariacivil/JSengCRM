const url = 'https://wakzdfeqyidjrdxcgtdy.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3pkZmVxeWlkanJkeGNndGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDUzOTQsImV4cCI6MjA4NTQ4MTM5NH0.NRrXNTZWrINU5tN1GGXijWC4UMbkOkB86G1WqW6SuBg';

async function testInsert() {
    const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

    // Create a client
    const cRes = await fetch(url + '/rest/v1/clients', {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
            name: 'Test Client',
            document: '0000',
            email: 'test@test.com',
            type: 'Pessoa Física',
            phone: '0000',
            address: 'Rua'
        })
    });
    const cText = await cRes.text();
    if (!cRes.ok) { console.log('Client fail', cText); return; }
    const clientId = JSON.parse(cText)[0].id;

    // Create a dummy proposal
    const pRes = await fetch(url + '/rest/v1/proposals', {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
            client_id: clientId,
            total: 1000,
            status: 'Pendente',
            date: new Date().toISOString()
        })
    });

    const pText = await pRes.text();
    console.log('Proposal insert status:', pRes.status);
    console.log('Proposal insert response:', pText);

    if (!pRes.ok) return;
    const proposal = JSON.parse(pText)[0];

    // Create an etapa
    const eRes = await fetch(url + '/rest/v1/proposal_etapas', {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
            proposal_id: proposal.id,
            name: 'Test Etapa',
            order: 0
        })
    });

    const eText = await eRes.text();
    console.log('Etapa insert status:', eRes.status);
    console.log('Etapa insert response:', eText);

    if (!eRes.ok) return;
    const etapa = JSON.parse(eText)[0];

    // Create an item
    const iRes = await fetch(url + '/rest/v1/proposal_items', {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
            proposal_id: proposal.id,
            etapa_id: etapa.id,
            parent_id: null,
            service_id: null,
            code: 'TEST-CODE',
            banco: 'PROPRIO',
            name: 'Test Item',
            type: 'INSUMO',
            origin: 'BASE',
            version: 1,
            quantity: 1,
            unit_price: 100,
            unit: 'un',
            order: 0
        })
    });

    const iText = await iRes.text();
    console.log('Item insert status:', iRes.status);
    console.log('Item insert response:', iText);
}

testInsert();
