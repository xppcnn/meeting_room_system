import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const storage = multer.diskStorage({
  destination: function (req, files, cb) {
    try {
      fs.mkdirSync(path.join(process.cwd(), 'my-uploads'));
    } catch (error) {}

    cb(null, path.join(process.cwd(), 'my-uploads'));
  },
  filename: function (req, file, callback) {
    const suffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    callback(null, file.fieldname + '-' + suffix);
  },
});

export { storage };
