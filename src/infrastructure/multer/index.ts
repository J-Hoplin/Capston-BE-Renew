import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { v4 } from 'uuid';

export const imageLocalDiskOption = (path: string): MulterOptions => {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const saveDestination = path;
        // Check destination
        if (!fs.existsSync(saveDestination)) {
          fs.mkdirSync(saveDestination);
        }
        cb(null, saveDestination);
      },
      filename: (req, file, cb) => {
        // profile image name format : {uuid}_{original_name}
        cb(null, `${v4()}_${file.originalname}`);
      },
    }),
  };
};
