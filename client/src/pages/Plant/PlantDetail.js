import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { SelectButton, TButton, MypageButton } from '../../components/Button';
import { ContainerRow, UDContainer, Form } from '../../components/Container';
import { ImageP, ImageI } from '../../components/Image';
import { Modal3 } from '../../components/Modal';
import InteriorDetail from './InteriorDetail';

// 가로 스크롤 생기는 특정 부분
const Interiors = styled.div`
  width: 100%;
  height: 11.5rem;
  white-space: nowrap;
  overflow-x: auto;
`;

function PlantDetail() {
  const history = useHistory();
  const location = useLocation();

  /* 페이지 로드 */
  const [plant, setPlant] = useState({
    id: 0,
    plantName: '',
    plantImage: '',
    plantDescription: '',
  });
  const [interiorsArray, setInteriorsArray] = useState([]);

  useEffect(() => {
    handleRecent(); // 처음엔 최신순
  }, []);

  // 최신순
  const handleRecent = () => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/plants/${location.state.plantId}`,
        {
          withCredentials: true,
        },
      )
      .then(res => {
        setPlant({
          ...plant,
          id: res.data.data.id,
          plantName: res.data.data.plantName,
          plantImage: res.data.data.plantImage,
          plantDescription: res.data.data.plantDescription,
        });
        setInteriorsArray(res.data.data.interiorsArray);
      });
  };
  // 인기순
  const handlePopular = () => {
    // 인기순 API 추가 필요
  };

  /* 나도 뽐내기 버튼 클릭 시, 글쓰기 페이지로 이동 */
  const [plantId, setPlantId] = useState(0);
  const [isNavigate, setIsNavigate] = useState('');
  const handleInteriorWrite = id => {
    setPlantId(id); // 식물 id 설정해주고
    setIsNavigate(true); // useEffect 실행해 해당 id 식물 상세 페이지로 이동
  };
  useEffect(() => {
    if (isNavigate) {
      history.push({
        pathname: '/interiorWrite',
        state: { plantId: plantId },
      });
      setIsNavigate(false);
    }
  }, [isNavigate]);

  /* 인테리어 사진 클릭 시, 인테리어 상세 모달 띄우기 */
  const [interiorId, setInteriorId] = useState(0);
  const [isNavigate2, setIsNavigate2] = useState('');

  const [isInteriorModalOpen, setIsInteriorModalOpen] = useState(false);
  const handleInteriorModal = () => {
    setIsInteriorModalOpen(!isInteriorModalOpen);
  };

  const handleInteriorDetail = id => {
    setInteriorId(id); // 인테리어 id 설정해주고
    setIsNavigate2(true); // useEffect 실행해 해당 id 인테리어 상세 모달 띄우기
  };
  useEffect(() => {
    // console.log('선인장사진이면 0이 떠야 정상', interiorId);
    if (isNavigate2) {
      setIsInteriorModalOpen(true);
      setIsNavigate2(false);
    }
  }, [isNavigate2]);
  return (
    <>
      <UDContainer>
        <Form>
          <ContainerRow>
            <ImageP src={plant.plantImage} alt="" />
            <div>
              <h1>{plant.plantName}</h1>
              <span>{plant.plantDescription}</span>
            </div>
          </ContainerRow>
          <hr />

          <MypageButton onClick={handleRecent} style={{ paddingLeft: '1rem' }}>
            최신순
          </MypageButton>
          <MypageButton onClick={handlePopular}>인기순</MypageButton>

          <span
            style={{
              display: 'inline-block',
              display: 'flex',
              float: 'right',
            }}
          >
            <SelectButton
              onClick={() => handleInteriorWrite(plant.id)}
              style={{ marginBottom: '1rem' }}
            >
              나도 뽐내기
            </SelectButton>
          </span>

          <Interiors>
            {interiorsArray.map(interior => {
              return (
                <>
                  <TButton onClick={() => handleInteriorDetail(interior.id)}>
                    <ImageI src={interior.image} alt="" />
                  </TButton>
                </>
              );
            })}
            {/* 인테리어 상세 모달 */}
            {isInteriorModalOpen ? (
              <Modal3 handleModal={handleInteriorModal}>
                <InteriorDetail
                  handleInteriorModal={handleInteriorModal}
                  interiorId={interiorId}
                />
              </Modal3>
            ) : null}

            {/* 테스트용 */}
            <TButton onClick={() => handleInteriorDetail(interiorId)}>
              <ImageI src="../../images/select/선인장.png" alt="" />
            </TButton>
            {/* 까지 지워 */}
          </Interiors>
        </Form>
      </UDContainer>
    </>
  );
}
export default PlantDetail;
