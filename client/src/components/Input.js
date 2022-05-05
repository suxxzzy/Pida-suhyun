import styled from 'styled-components';

export const SignInput = styled.input`
  margin: 0.8rem 0 0.8rem 0;
  padding-left: 1rem; // 글자위치

  width: 30rem;
  height: 3.7rem;
  border: solid 0.1rem black;
  border-radius: 1.6rem;
  font-size: 1.5rem;

  ::placeholder {
    color: #bebebe;
    font-size: 1.5rem;
    font-weight: 800;
  }
  :focus {
    outline: none;
  }
`;

export const SignupInput = styled(SignInput)`
  margin: 0;
  width: 26.7rem;
  border: none;
`;

// 댓글 작성 창
export const ComentWrite = styled.textarea`
  width: 28rem;
  height: 2.4rem;
  resize: none;
  border-radius: 1rem;
  border: solid 0.13rem #bcbcbc;
  padding: 0.5rem; //텍스트 상자 안
  margin: 1rem 0 0 2rem;
  font-size: 0.8rem;
`;

// 글 작성 수정 - 이미지 업로드
export const UploadInput = styled.input`
  padding: 1rem 0rem 0rem 0rem;
  width: 10rem;
`;
// 글 작성 수정 - 내용
export const ContentTextArea = styled.textarea`
  width: 50rem;
  height: 14rem;
  resize: none;
  border-radius: 3rem;
  border: solid 0.15rem black;
  padding: 1.5rem;
  margin-top: 1rem;
  font-size: 0.8rem;
`;