const s3 = require('../config/s3_plant');
const multer = require('multer');
const multerS3 = require('multer-s3');

module.exports = {
  //이미지 업로드
  plantPost: multer({
    storage: multerS3({
      s3,
      bucket: 'pida-plant-info-image-server',
      acl: 'public-read-write',
      contentType: multerS3.AUTO_CONTENT_TYPE, //없으면 안됨
      key: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
      },
      limits: { fileSize: 1000 * 1000 * 3 }, //3MB(사용자기준)
    }),
  }),

  //이미지 삭제
  delete: (req, res) => {
    s3.deleteObject(
      {
        Bucket: 'pida-plant-info-image-server',
        Key: req.fileName,
      },
      (err, data) => {
        if (err) {
          throw err;
        }

        //요청 메서드가 patch일때만 응답을 다르게 분기작성
        if (req.route.stack[0].method === 'patch') {
          return res.status(200).json({
            data: req.data,
            message: '식물 상세정보 수정에 성공했습니다',
          });
        }
        return res
          .status(204)
          .json({ message: '식물 상세정보 삭제에 성공했습니다' });
      },
    );
  },
};
