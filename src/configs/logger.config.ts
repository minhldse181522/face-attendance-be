import '@libs/utils/dotenv';
import { get } from 'env-var';

export const loggerConfig = {
  node: get('ELASTICSEARCH_NODE').default('http://localhost:9200').asString(),
};
