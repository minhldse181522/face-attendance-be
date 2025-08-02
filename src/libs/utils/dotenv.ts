import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envName = process.env.NODE_ENV ?? 'development';
const envPath = path.resolve(process.cwd(), `.env.${envName}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded env file: .env.${envName}`);
} else {
  dotenv.config();
  console.log(`.env.${envName} not found, loaded default .env`);
}
