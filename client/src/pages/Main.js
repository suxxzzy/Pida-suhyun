import { RightContainer, TransContainer } from '../components/Container';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

const Intro = styled.div`
  color: #3ba914;
  font-size: 3.3rem;
  font-weight: 570;
  letter-spacing: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  animation: type 3s;
  @keyframes type {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
`;

const Pida = styled.div`
  margin-left: 9.45rem; // 조정하면 글자 움직임
  font-size: 5.3rem;
  letter-spacing: 0.5rem;
  @media screen and (max-width: 760px) {
    margin-left: 14rem;
  }
`;

const Move = styled.button`
  margin-top: 3rem;
  font-size: 1.5rem;
  font-weight: 500;
  color: rgb(163, 163, 163);
  :hover {
    color: black;
  }
  background-color: transparent;
  border: none;
  border-color: transparent;
  letter-spacing: 0.5rem;

  animation: loading 4s alternate;
  @keyframes loading {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const MainImage = styled.img`
  padding-right: 4rem;
  width: 25rem;
  @media screen and (max-width: 760px) {
    padding: 0rem;
  }
`;

function Main() {
  const history = useHistory();

  const handleSelect = () => {
    history.replace('/select');
  };
  const handleAll = () => {
    history.replace('/search');
  };
  const handleSerchFlower = () => {
    history.replace('/florists');
  };

  return (
    <>
      <TransContainer style={{ minHeight: '75vh', alignItems: 'center' }}>
        <div>
          <MainImage src="../images/mainImage.png" />
        </div>
        <div style={{ display: 'flex', textAlign: 'center' }}>
          <div style={{ paddingTop: '3rem' }}>
            <Intro>
              당신의 플<span style={{ color: 'black' }}>랜테리어,</span>
              <Pida>"Pida"</Pida>
            </Intro>
            <div style={{ alignItems: 'center', float: 'right' }}>
              <RightContainer>
                <div>
                  <Move onClick={handleSelect}>
                    나의 플랜테리어 취향 찾기 →
                  </Move>
                </div>
                <div>
                  <Move onClick={handleAll} style={{ margin: '1rem 0 0 0' }}>
                    "피다" 식물 보기 →
                  </Move>
                </div>
                <div>
                  <Move
                    onClick={handleSerchFlower}
                    style={{ margin: '1rem 0 0 0' }}
                  >
                    주변 꽃집 찾기 →
                  </Move>
                </div>
              </RightContainer>
            </div>
          </div>
        </div>
      </TransContainer>
    </>
  );
}
export default Main;
