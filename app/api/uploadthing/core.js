import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import prisma from '@/lib/db';
import { verifyTokenFromRequest } from '@/lib/upload-auth';

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await verifyTokenFromRequest(req);
      if (!user?.id) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatar: file.url || file.ufsUrl },
      });
      return { url: file.url || file.ufsUrl };
    }),
};

export default ourFileRouter;
