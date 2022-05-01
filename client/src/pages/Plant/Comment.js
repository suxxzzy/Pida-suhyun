import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { DetailButton } from '../../components/Button';
import { WriteUser } from '../../components/Div';
import { ComentWrite } from '../../components/Input';

function Comment(props) {
  const [comment, setComment] = useState({
    id: '',
    nickname: '',
    comment: '',
  });

  /* 댓글 수정 */
  const [isModifyComment, setIsModifyComment] = useState(false);

  const [newComment, setNewComment] = useState('');
  const handleModifyCommentStart = comment => {
    console.log('댓글 수정시작');
    setComment({
      ...comment,
      id: comment.id,
      nickname: comment.nickname,
      comment: comment.comment,
    });

    setIsModifyComment(true);
    setNewComment(comment.comment);
  };

  const handleInputComment = e => {
    setNewComment(e.target.value);
  };

  /* 댓글 수정 완료 */
  const handleModifyCommentEnd = comment => {
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/comments/${comment.id}`,
        { comment: newComment },
        { withCredentials: true },
      )
      .then(res => {
        console.log('댓글 수정완료');
        setIsModifyComment(false);
        setTimeout(window.location.reload.bind(window.location), 600000); // 새로고침..
      })
      .catch();
  };

  /* 댓글 수정 취소 */
  const handleCancelComment = () => {
    setIsModifyComment(false);
  };

  /* 댓글 삭제 */
  const handleDeleteComment = comment => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/comments/${comment.id}`, {
        withCredentials: true,
      })
      .then(res => {
        console.log(`댓글삭제`);
        setTimeout(window.location.reload.bind(window.location), 600000); // 새로고침..
      });
  };

  return (
    <>
      {/* 인테리어 댓글 맵*/}
      <div style={{ padding: '1.5rem 1.5rem 0rem 1.5em' }}>
        {props.commentArray.map(comment => {
          return (
            <>
              <WriteUser>{comment.nickname}</WriteUser>
              {/* isEditable이 true라면 수정 삭제 버튼을 보여준다 */}
              {comment.isEditable ? (
                <>
                  {!isModifyComment ? (
                    <>
                      <DetailButton
                        onClick={() => handleModifyCommentStart(comment)}
                      >
                        수정
                      </DetailButton>
                      <DetailButton
                        onClick={() => handleDeleteComment(comment)}
                      >
                        삭제
                      </DetailButton>
                    </>
                  ) : (
                    <>
                      {/* 수정 버튼을 눌렀다면 수정칸과 확인 취소 버튼을 보여준다 */}
                      <WriteUser>{comment.nickname}</WriteUser>
                      <DetailButton
                        onClick={() => handleModifyCommentEnd(comment)}
                      >
                        확인
                      </DetailButton>
                      <DetailButton
                        onClick={() => handleCancelComment(comment)}
                      >
                        취소
                      </DetailButton>
                      <div>
                        <ComentWrite
                          style={{ marginLeft: '0rem' }}
                          type="text"
                          maxLength="200"
                          onChange={handleInputComment}
                          value={newComment}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : null}
              <div style={{ padding: '0 0 1.5rem 0.5rem', fontSize: '0.8rem' }}>
                {comment.comment}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}
export default Comment;