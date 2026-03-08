import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLeadsSchema() {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) {
        console.error('Error fetching leads:', error);
        // If it fails, let's try to get column names via RPC if available or just list what we can
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'leads' });
        if (colError) {
            console.log('Could not get columns via RPC.');
        } else {
            console.log('Columns:', cols);
        }
    } else {
        if (data && data.length > 0) {
            console.log('Lead row keys:', Object.keys(data[0]));
        } else {
            console.log('No leads found, but table exists. Trying to insert a dummy to see error/columns.');
        }
    }
}

checkLeadsSchema();
