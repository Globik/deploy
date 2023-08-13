// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import cookie from 'cookie';

const dataFilePath = path.join(process.cwd(), 'data.json');

interface User {
  username: string;
  password: string;
  privilege: boolean;
}

interface LoginRequestBody {
  username: string;
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Check if the data.json file exists
      const dataFileExists = await fs.promises
        .access(dataFilePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);

      if (!dataFileExists) {
        return res.status(401).json({ message: 'Data file not found' });
      }

      const rawData = await fs.promises.readFile(dataFilePath, 'utf-8');
      const users: User[] = JSON.parse(rawData);

      const { username, password } = req.body as LoginRequestBody;

      const user = users.find((user) => user.username === username);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Set the 'username' cookie with the user's username
        res.setHeader(
          'Set-Cookie',
          cookie.serialize('username', username, {
            httpOnly: true,
            maxAge: 3600, // 1 hour (you can adjust this as needed)
            path: '/',
          })
        );

        return res.status(200).json({ message: 'Login successful', user });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
