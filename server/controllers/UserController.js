const { Op } = require('sequelize');
const { User, Interior, Interior_like } = require('../models/Index');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
var appDir = path.dirname(require.main.filename);
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);

module.exports = {
  //이메일 인증 코드 받기
  getEmailCode: async (req, res) => {
    try {
      //사용자로부터 이메일 값을 받는다.
      const { email } = req.body;
      //값이 없으면 없다고 에러 응답
      if (!email) {
        res.status(400).json({ message: '이메일 값이 없습니다' });
      }
      //이메일이 이미 존재하고, 가입된 사용자라면
      const joinedUser = await User.findOne({
        where: { email, emailAuthCode: null },
      });
      if (joinedUser) {
        return res.status(409).json({ message: '이미 가입된 이메일입니다' });
      }

      //이메일이 이미 존재하고, 인증코드가 null이 아니면 DB에 인증코드 새로 만들어서 등록하고 이메일로 보내준다.
      //인증코드 만들기
      const emailAuthCode = Math.random().toString().slice(2, 8);
      const tempnick = nanoid().slice(0, 8);

      const tempUser = await User.findOne({
        where: { email, emailAuthCode: { [Op.not]: null } },
      });

      if (tempUser) {
        //DB에 사용자 정보 가가입
        await User.update(
          {
            emailAuthCode,
            nickname: tempnick,
          },
          { where: { email } },
        );
      } else {
        //완전 처음 가입
        await User.create({
          emailAuthCode,
          nickname: tempnick,
          email,
          platformType: 0,
        });
      }

      //만약에 5분이 지났는데도, 가입을 하지 않는다면 자동으로 데이터를 삭제한다
      setTimeout(async () => {
        await User.findOne({ where: { emailAuthCode } }).then(async data => {
          if (data) {
            await User.destroy({ where: { emailAuthCode } });
          }
        });
      }, 5 * 60 * 1000);

      //이메일 전송
      let emailTemplate;
      ejs.renderFile(
        appDir + '/template/emailAuth.ejs',
        { email, emailAuthCode },
        function (err, data) {
          if (err) {
            console.log(err);
          }
          emailTemplate = data;
        },
      );

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });

      let mailOptions = await transporter.sendMail({
        from: `Pida`,
        to: email,
        subject: 'Pida 회원가입을 위한 인증 메일입니다',
        html: emailTemplate,
      });

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
        console.log('Finish sending email : ' + info.response);
        res.status(201).json({
          data: { email },
          message: '이메일 인증코드를 발송했습니다',
        });
        transporter.close();
      });
    } catch (e) {
      //서버 에러
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 이메일 인증 처리에 실패했습니다' });
    }
  },

  // 인증 코드
  verifyEmailCode: async (req, res) => {
    try {
      // eac 받아옴
      const { emailAuthCode } = req.body;

      // 있긴 함? 없으면 400 컷
      if (!emailAuthCode) {
        return res.status(400).json({ message: '인증 코드가 없습니다' });
      }

      // 해당 인증 코드를 가진 가가입 유저를 먼저 찾아옴
      const tempUser = await User.findOne({
        where: { emailAuthCode },
      });

      // 그 친구의 이메일 <- 리턴해줄 수 있도록
      const tempUserEmail = await User.findOne({
        attributes: ['email'],
        where: { emailAuthCode },
      });

      if (tempUser) {
        return res.status(200).json({
          data: { email: tempUserEmail.email },
          message: '이메일이 인증 되었습니다',
        });
      } else {
        console.log('유저 없어 돌아가 ----------------> ');
        res
          .status(401)
          .json({ message: '이메일 인증코드가 유효하지 않습니다' });
      }
    } catch (e) {
      //서버 에러
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 이메일 인증 처리에 실패했습니다' });
    }
  },
  //닉네임 중복 체크
  checkNickname: async (req, res) => {
    try {
      const { nickname } = req.body;
      if (!nickname) {
        res.status(400).json({ message: '닉네임 값이 없습니다' });
      }
      //닉네임을 받아서, DB 에서 사용자가 존재하는지 확인한다,
      const userInfoByNickname = await User.findOne({ where: { nickname } });
      if (userInfoByNickname) {
        return res
          .status(409)
          .json({ message: '이미 사용중인 닉네임이 존재합니다' });
      }
      return res
        .status(200)
        .json({ message: '닉네임 중복체크를 통과했습니다.' });
    } catch (e) {
      //서버 에러
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 닉네임 중복체크 처리에 실패했습니다' });
    }
  },
  //회원가입
  signup: async (req, res) => {
    try {
      //사용자 이메일, 닉네임, 패스워드 가지고 온다
      const { email, nickname, password } = req.body;
      //이메일, 닉네임, 패스워드 하나라도 빠진 경우(유효한 양식이 아닌경우),
      //회원 가입에 실패했다고 응답을 보낸다.
      if (!email || !nickname || !password) {
        return res.status(400).json({ message: '회원가입에 실패하였습니다.' });
      }

      console.log('가입가능');
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log(hashedPassword, '암호화된비번');
      await User.update(
        {
          password: hashedPassword,
          nickname,
          emailAuthCode: null,
        },
        { where: { email } },
      );
      const newUser = await User.findOne({ where: { email } });
      delete newUser.dataValues.password;
      delete newUser.dataValues.emailAuthCode;
      console.log(newUser, '누구니?');
      return res
        .status(201)
        .json({ data: newUser, message: '회원가입에 성공했습니다' });
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 회원 가입 처리에 실패했습니다' });
    }
  },
  // 회원정보조회
  getInfo: async (req, res) => {
    try {
      // Users: 특정 유저 선택 쿼리
      const userInfo = await User.findOne({
        where: { id: req.id },
        attributes: ['id', 'email', 'nickname', 'platformType'],
      });

      //사용자가 업로드한 글 모아보기
      const uploads = await Interior.findAll({
        attributes: ['id', 'image'],
        where: { userId: req.id },
      });
      console.log(
        uploads.map(el => el.dataValues),
        '업로드한글',
      );
      //사용자가 좋아요한 글 모아보기
      const likes = await Interior.findAll({
        attributes: ['id', 'image'],
        include: [
          {
            model: User,
            attributes: [],
          },
          {
            model: User,
            attributes: [],
            through: Interior_like,
            where: { id: req.id },
          },
        ],
      });
      const { id, email, nickname, platformType } = userInfo;

      // 해당 유저가 존재하지 않는 경우
      if (!userInfo) {
        return res
          .status(404)
          .json({ message: '회원 정보 조회에 실패했습니다' });
      } else {
        // 해당 유저가 존재할 경우
        return res.status(200).json({
          data: {
            id,
            email,
            nickname,
            platformType,
            uploads,
            //문제의 코드 수정
            likes: likes.map(el => el.dataValues),
          },
          message: '회원 정보 조회에 성공했습니다',
        });
      }
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 회원 정보 조회 서버 에러' });
    }
  },
  // 닉네임수정
  editNickname: async (req, res) => {
    try {
      const { newNickname } = req.body;
      console.log('사용자닉네임', newNickname, '닉네임');

      // newNickname 이 정규표현식을 통과하지 못 한다면,
      // 400 을 돌려주고 정지
      // 정규표현식 이스케이프
      const regNickname = /^[^!@#$%\^&*(\)\-_+={\}[\]\\|:;"'<>?/]{1,8}$/;

      if (!regNickname.test(newNickname)) {
        return res.status(400).json({
          message:
            '닉네임 변경에 실패했습니다. 8자 이하의 닉네임인지 다시 확인해주세요. 특수문자가 포함되면 안 됩니다.',
        });
      }

      const nickname = await User.findOne({ where: { nickname: newNickname } });
      if (nickname) {
        return res.status(409).json({
          message: '이미 사용중인 닉네임이 존재합니다',
        });
      }

      await User.update({ nickname: newNickname }, { where: { id: req.id } });

      return res.status(204).json({
        data: { newNickname },
        message: '닉네임 변경에 성공했습니다',
      });
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 닉네임 변경에 실패했습니다' });
    }
  },
  //비번수정
  editPassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      //만약에 두 값이 모두 주어지지 않았다면 둘 다 달라고 응답
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: '현재 비밀번호와 새 비밀번호 모두 입력해주세요' });
      }
      //두 값 모두 주어졌다.
      //기존의 비밀번호가 DB 상의 비번이랑 일치하지 않는다: 비번 다시 입력하라고 응답
      const userInfo = await User.findOne({ where: { id: req.id } });
      const match = await bcrypt.compare(
        oldPassword,
        userInfo.dataValues.password,
      );

      if (!match) {
        return res
          .status(400)
          .json({ message: '기존 비밀번호가 일치하지 않습니다' });
      }

      //기존 비번 올바르게 입력했음.
      //새로운 비번도 형식에 맞는지 확인한다
      //형식에 맞지 않으면 맞게 입력해달라고 할 것
      const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
      if (!pattern.test(newPassword)) {
        return res
          .status(400)
          .json({ message: '비밀번호를 형식에 맞게 입력해주세요' });
      }
      //형식에 맞으면 업데이트하고 성공 응답 보낼것
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await User.update(
        { password: hashedPassword },
        {
          where: {
            id: req.id,
          },
        },
      )
        .then(result => {
          console.log('응답 메세지 찍히나??');
          return res
            .status(204)
            .json({ message: '비밀번호 변경에 성공했습니다' });
        })
        .catch(console.log);
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 비밀번호 변경에 실패했습니다' });
    }
  },
  //탈퇴
  withdraw: async (req, res) => {
    try {
      //이전의 미들웨어에서 토큰으로 사용자 인증에 성공을 했다.
      //req.id로 사용자 pk 받아서 이거로 해당 사용자 정보를 삭제한다.
      await User.destroy({
        where: {
          id: req.id,
        },
      });
      return res
        .cookie('accessToken', null, { maxAge: 0 })
        .status(204)
        .json({ message: '회원탈퇴에 성공했습니다' });
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 회원 탈퇴 처리에 실패했습니다' });
    }
  },
};
