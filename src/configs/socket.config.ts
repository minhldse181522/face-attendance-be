import '@libs/utils/dotenv';

import { get } from 'env-var';

export const socketConfig = {
  channelPrefix: get('SOCKET_CHANNEL_PREFIX').default('FAAS').asString(),
};
