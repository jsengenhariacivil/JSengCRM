const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing insert into clients...');
  const { data: cData, error: cErr } = await supabase.from('clients').insert([{
    name: 'Test Client',
    type: 'Pessoa Física'
  }]).select();
  
  if (cErr) console.error('Clients error:', cErr);
  else console.log('Clients insert success:', cData);

  console.log('Testing insert into financial_records...');
  const { data: fData, error: fErr } = await supabase.from('financial_records').insert([{
    type: 'Receita',
    description: 'Test',
    amount: 100,
    financial_entity: 'PJ'
  }]).select();

  if (fErr) console.error('Finance error:', fErr);
  else console.log('Finance insert success:', fData);
}

testInsert();
