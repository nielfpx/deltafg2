import { createClient } from '@supabase/supabase-js';
import { IncomingMessage, ServerResponse } from 'http';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('vip_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.statusCode = 200;
      res.end(JSON.stringify({ data: data || [], total: data?.length || 0 }));
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Falha ao buscar dados' }));
    }
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Método não permitido' }));
  }
};
