// pages/api/registration.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const dataFilePath = path.join(process.cwd(), 'data.json');

interface User {
  username: string;
  password: string;
  privilege: boolean;
}

interface RegistrationRequestBody {
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

      let users: User[] = [];
      if (dataFileExists) {
        const rawData = await fs.promises.readFile(dataFilePath, 'utf-8');
        if (rawData) {
          users = JSON.parse(rawData);
        }
      }

      const { username, password } = req.body as RegistrationRequestBody;
console.log("username, password ", username, password);
if(!username || !password){
	 return res.status(200).json({ error: 'No password or no username' });
}
      const existingUser = users.find((user) => user.username === username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        username,
        password: hashedPassword,
        privilege: false,
      };

      users.push(newUser);

      await fs.promises.writeFile(dataFilePath, JSON.stringify(users, null, 2));

      return res.status(200).json({ message: 'Registration successful' , username});
    } catch (error) {
      console.error('Error during registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
