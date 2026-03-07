import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function runTest() {
    console.log('\n--- Query Tests ---');
    const queries = await Promise.all([
        supabase.from('proposal_etapas').select('id').limit(1),
        supabase.from('proposal_items').select('parent_id, etapa_id').limit(1)
    ]);

    console.log('Etapas query success:', !queries[0].error);
    if (queries[0].error) console.error(queries[0].error.message);

    console.log('Items query success:', !queries[1].error);
    if (queries[1].error) console.error(queries[1].error.message);
}

runTest();
