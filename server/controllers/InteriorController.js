const { User, Interior, Comment, Interior_like } = require('../models/Index');

module.exports = {
  //인테리어 게시글 상세조회: 권한이 없어도 된다.
  get: async (req, res) => {
    try {
      // 어떤 게시글을 조회할건지 알아야한다
      const { id: postId } = req.params;
      //만약에 아이디가 주어지지 않는다면 에러 메세지 응답
      if (!postId) {
        return res
          .status(400)
          .json({ message: '인테리어 게시글 조회에 실패했습니다' });
      }
      console.log(postId, '게시물아이디');

      //편집 가능 여부,
      const Author = await Interior.findOne({
        where: { userId: req.id },
        attributes: ['userId'],
      });
      let isEditable =
        Author !== null && Author.userId === req.id ? true : false;

      //좋아요 여부,
      const isLiked = await Interior_like.findOne({
        where: { userId: req.id, interiorId: postId },
      });

      //게시물에서 게시물 아이디, 유저아이디, 닉네임, 이미지, 내용, 작성시각 가지고오기
      const post = await Interior.findAll({
        where: { id: postId },
        attributes: ['id', 'userId', 'image', 'content', 'createdAt'],
      });
      console.log(post, '이미지');
      const nickname = await User.findByPk(post[0].userId, {
        attributes: ['nickname'],
      });

      //댓글 목록 전체: 현재 댓글에 존재하는 userId가 req.id와 다른 경우, 수정 삭제 권한 없다고 알려주자.: api 수정 필요
      let comments = await Comment.findAll({
        attributes: ['id', 'userId', 'comment'],
        include: [
          {
            model: Interior,
            attributes: [],
            required: true,
            where: { id: postId },
          },
          {
            model: User,
            attributes: ['nickname'],
            required: true,
          },
        ],
      });
      comments = comments.map(el => {
        const { id, userId, comment, User } = el;
        return {
          id,
          userId,
          comment,
          nickname: User.dataValues.nickname,
          //댓글 수정 삭제 가능여부
          isEditable: userId === req.id ? true : false,
        };
      });

      res.status(200).json({
        data: {
          id: postId,
          isEditable,
          isLiked: !!isLiked,
          userId: post[0].userId,
          nickname: nickname.nickname,
          image: post[0].image,
          content: post[0].content,
          createdAt: post[0].createdAt,
          comments,
        },
        message: '게시글과 댓글을 가져왔습니다',
      });
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 인테리어 게시글과 댓글 조회에 실패했습니다' });
    }
  },
  //게시글 작성
  post: async (req, res) => {
    try {
      //만약에 게시글과 넘어온 파일링크가 하나라도 없으면 작성거부: 클라에서 사전에 차단.
      //문제점: 클라에서 이거 안해줄 경우엔 실패해도 s3에 이미지 올라감..
      const { id: plantId } = req.params;
      const { content } = req.body;
      console.log(
        '식물:',
        plantId,
        '이미지주소',
        req.file.location,
        '내용',
        content,
      );
      if (!plantId || !req.file.location || !content) {
        return res
          .status(400)
          .json({ message: '인테리어 게시글 업로드에 실패했습니다' });
      }
      //다 있을 경우 201	인테리어 게시글 업로드에 성공했습니다.
      //게시글 아이디 및 생성시각
      const newPost = Interior.create({
        userId: req.id,
        plantId,
        content,
        image: req.file.location,
      });
      //사용자 닉네임
      const nickname = User.findByPk(req.id, { attributes: ['nickname'] });

      console.log(nickname);

      Promise.all([newPost, nickname])
        .then(value => {
          const [newPost, nickname] = value;
          console.log(newPost, nickname, '결과');
          const { id, userId, content, image, createdAt } = newPost.dataValues;
          return res.status(201).json({
            data: {
              id,
              isliked: false, //처음 생성한 게시물이니 좋아요는 초기상태로.
              userId,
              nickname: nickname.nickname,
              image,
              content,
              createdAt,
            },
            message: '인테리어 게시글 업로드에 성공했습니다',
          });
        })
        .catch(console.log);
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 인테리어 게시글과 댓글 조회에 실패했습니다' });
    }
  },
  //게시글 수정 https://velog.io/@sangeun-jo/NodeJS-AWS-S3-%EB%B2%84%ED%82%B7-%EC%97%B0%EB%8F%99#5-%EA%B0%9D%EC%B2%B4-%EB%B3%80%EA%B2%BD
  patch: async (req, res, next) => {
    //글과 사진 받음. 글은 두고 사진만 삭제요청
    //받은 사진 업로드 명령.
    //여기선 가장 마지막 부분
    try {
      //만약에 게시글과 넘어온 파일링크가 하나라도 없으면 작성거부
      const { id: postId } = req.params;
      const { content: newContent } = req.body;
      if (!plantId || !req.file.location || !content) {
        return res
          .status(400)
          .json({ message: '인테리어 게시글 수정에 실패했습니다' });
      }
      //게시물 수정
      const updatedPost = await Interior.update(
        {
          content: newContent,
          image: req.file.location,
        },
        { where: { id: postId } },
      );

      const { id, userId, nickname, content, image, createdAt } =
        updatedPost.dataValues;
      return res.status(201).json({
        data: {
          id,
          userId,
          nickname,
          content,
          image,
          createdAt,
        },
        message: '인테리어 게시글 수정에 성공했습니다',
      });
      next();
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 인테리어 게시글 수정에 실패했습니다' });
    }
  },
  //게시글 삭제
  delete: async (req, res, next) => {
    //로직: 삭제할 게시글의 아이디를 받아와서 DB 테이블에서 삭제한다
    //s3상에 올라간 이미지는 어떻게 삭제해야할까?
    try {
      //파일 이름은 DB 상에 저장된 url 값에서 추출한다.

      next();
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 인테리어 게시글과 댓글 조회에 실패했습니다' });
    }
  },
};
