import * as multer from 'multer';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, files, cb) {
    try {
      fs.mkdirSync('uploads');
    } catch (error) {}

    cb(null, 'uploads');
  },
  filename: function (req, file, callback) {
    const suffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    callback(null, suffix);
  },
});

export { storage };
