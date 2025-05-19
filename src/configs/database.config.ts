import '@libs/utils/dotenv';
import { get } from 'env-var';

export const databaseConfig = {
  databaseUrl: get('DATABASE_URL').required().asString(),
};
