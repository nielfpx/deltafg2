import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('vip_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ data: data || [], total: data?.length || 0 });
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
      res.status(500).json({ error: 'Falha ao buscar dados' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
