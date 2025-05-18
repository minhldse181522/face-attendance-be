import '@libs';
import { get } from 'env-var';

export const databaseConfig = {
  databseUrl: get('DATABASE_URL').required().asString(),
};
