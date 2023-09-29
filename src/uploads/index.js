const multer = require("multer");
const MAX_FILE_SIZE = 7340032;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `haydovchi${req.body.oneId}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    if (file.size >= MAX_FILE_SIZE) {
      cb(
        new Error("Max file size! Rasm hajmi 7MB dan ko'p bo'lmasligi lozim."),
        false
      );
    }
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload };
