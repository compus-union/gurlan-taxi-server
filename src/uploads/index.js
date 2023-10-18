const multer = require("multer");
const MAX_FILE_SIZE = 7340032;
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `haydovchi-` + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

module.exports = { upload };
