import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { date, roomId, hours, instruments, bandName, genre } = req.body;

    try {
      const { data, error } = await supabase
        .from('reservas')
        .insert([
          { date, roomId, hours, instruments, bandName, genre }
        ])
        .select('id');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Data is null');
      }

      res.status(200).json({ id: data[0].id });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}