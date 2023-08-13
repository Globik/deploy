import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const cookies = cookie.parse(req.headers.cookie || '');

    if (cookies.username) {
      return res.status(200).json({ isAuthenticated: true, username: decodeURIComponent(cookies.username) });
    } else {
      return res.status(200).json({ isAuthenticated: false });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
