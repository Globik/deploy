import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Удаляем куку для авторизации
    res.setHeader('Set-Cookie', cookie.serialize('username', '', { maxAge: -1, path: '/' }));
    return res.status(200).json({ message: 'Logout successful' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
