module.exports = {
  emailValidator: email => {
    const regExp = /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return regExp.test(email);
  },

  pwValidator: password => {
    const regExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    return regExp.test(password);
  },

  pwMatchValidator: (password, rePassword) => {
    if (password === '' || rePassword === '') return false;
    return password === rePassword;
  },

  nicknameValidator: nickname => {
    const regExp = /^[A-Za-z0-9_ㄱ-ㅎㅏ-ㅣ가-힣]{1,8}$/;
    return regExp.test(nickname);
  },
};
