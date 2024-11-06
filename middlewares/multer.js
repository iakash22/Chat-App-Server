const multer = require('multer');

exports.multerUpload = multer({
    limits: {
        fieldSize: 1024 * 1024 * 2,
    }
});

exports.singleAvatar = this.multerUpload.single('avatar');
exports.attachmentsMulter = this.multerUpload.array("files", 5);
