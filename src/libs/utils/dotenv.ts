import * as path from 'path';
import { config } from 'dotenv';

//Khởi tạo dotenv
const envPath: string = path.resolve(
  __dirname,
  process.env.NODE_ENV === 'test' ? '../../../.env.test' : '../../../.env',
);
config({ path: envPath });
