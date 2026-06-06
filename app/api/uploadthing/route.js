import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';
import { getUploadThingToken } from '@/lib/uploadthing-token';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: getUploadThingToken() ?? undefined,
  },
});
