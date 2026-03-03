import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

const supabaseUrl = 'https://wakzdfeqyidjrdxcgtdy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3pkZmVxeWlkanJkeGNndGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDUzOTQsImV4cCI6MjA4NTQ4MTM5NH0.NRrXNTZWrINU5tN1GGXijWC4UMbkOkB86G1WqW6SuBg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTypes() {
    const typesToTest = [
        '', null, undefined, 'BANANA'
    ];

    let results = {};

    for (const type of typesToTest) {
        const { data, error } = await supabase.from('team_members').insert([
            {
                id: crypto.randomUUID(),
                name: 'Teste ' + type,
                role: 'Teste',
                type: type, // might be undefined, won't serialize
                email: 'teste@teste.com',
                phone: '111',
                status: 'Ativo'
            }
        ]);

        if (error) {
            results[String(type)] = error.message;
        } else {
            results[String(type)] = "SUCCESS";
        }
    }

    fs.writeFileSync('test_results3.json', JSON.stringify(results, null, 2));
}

testTypes();
