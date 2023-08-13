import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import users from '../../data.json'; // Путь к вашему data.json

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    const user = users.find((user) => user.username === username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (passwordMatch) {
      res.setHeader('Set-Cookie', `username=${encodeURIComponent(username)}; HttpOnly; Path=/; Max-Age=3600`);

      return res.status(200).json({ message: 'Login successful', user });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
