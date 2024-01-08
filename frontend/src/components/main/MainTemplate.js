/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import './MainTemplate.scss';
import ImageSlider from './ImageSlider';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { API_BASE_URL, ADOPT, BOARD } from '../../global/config/host-config';
import LoadingPink from '../../global/LoadingPink';

// 모달창 설정
const Modal = ({ children, visible, onClose }) => {
  if (!visible) return null;

  return (
    <div
      className='modal-overlay'
      onClick={onClose}
    >
      <div
        className='modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const MainTemplate = () => {
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(() => {
    const dontShowToday = localStorage.getItem('dontShowToday');
    if (dontShowToday) {
      const date = new Date();
      if (date.toISOString().slice(0, 10) === dontShowToday) {
        return false;
      }
    }
    return true;
  });

  const onClose = () => {
    setPopupVisible(false);
  };

  const onCloseToday = () => {
    const date = new Date();
    localStorage.setItem('dontShowToday', date.toISOString().slice(0, 10));
    setPopupVisible(false);
  };

  // 상태 변수 선언
  // 입양게시글 데이터
  const [adoptList, setAdoptList] = useState([
    {
      desertionNo: 1,
      breed: '펫종',
      sex: '성별',
      age: 12,
      profileImg: '/img/dogPic/dog1.png',
    },
  ]);
  // 후기게시글 데이터
  const [reviewList, setReviewList] = useState([
    {
      boardNo: 1,
      imgage: '/img/dogPic/dog1.png',
      registDate: '2023.05.28',
    },
  ]);
  // 자유게시글 데이터
  const [boardList, setBoardList] = useState([
    {
      boardNo: 1,
      category: '분양후기',
      title: '분양 받았어요~ 진짜 우리 강아지가 얼마나 이쁘냐면요',
      registDate: '2023.05.28',
    },
  ]);
  // 로딩 상태 변수를 추가합니다.
  const [loading, setLoading] = useState(true);

  // 이미지 URL을 저장할 새로운 상태
  const [reviewImages, setReviewImages] = useState({});

  // 이미지 로딩이 되었는지 확인하는 상태 추가
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const limitedAdoptList = adoptList.slice(0, 8);
  const limitedBoardList = boardList.slice(0, 5);

  useEffect(() => {
    setLoading(true); // 데이터를 가져오기 전에 로딩 상태를 true로 설정
    // '/adopt' 요청
    axios
      .get(`${API_BASE_URL}${ADOPT}`)
      .then((res) => {
        setAdoptList(res.data.adoptLists.slice(0, 8));
        setLoading(false); // 데이터를 가져온 후 로딩 상태를 false로 설정
      })
      .catch((err) => {
        console.error(err);
        setLoading(false); // 데이터를 가져온 후 로딩 상태를 false로 설정
      });

    // '/board' 요청
    // console.log(`${API_BASE_URL}`);
    axios
      .get(`${API_BASE_URL}${BOARD}`)
      .then((res) => {
        // console.log('board 요청', res);
        const boardData = res.data.boards.filter(
          (board) => board.image === null
        );
        const reviewData = res.data.boards.filter(
          (board) => board.image !== null
        );

        setReviewList(reviewData.slice(0, 5)); // '후기' 데이터를 상태로 설정
        setBoardList(boardData.slice(0, 5)); // '자유' 데이터를 상태로 설정
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // s3 이미지 따로 요청 보내야 함
  useEffect(() => {
    // 'reviewList' 상태가 변경될 때마다 'limitedReviewList'를 계산합니다.
    const limitedReviewList = reviewList.slice(0, 5);

    const loadImages = async () => {
      const promises = limitedReviewList.map(async (review) => {
        const response = await fetch(
          `${API_BASE_URL}${BOARD}/load-profile/${review.boardNo}`
        );
        if (!response.ok) {
          // 이미지를 불러오는 데 실패한 경우, 리뷰에 default_image_url을 할당
          return [review.boardNo, 'default_image_url'];
        }
        const imageBlob = await response.blob();
        console.log('무한 요청 얘임?' + response);
        return [review.boardNo, URL.createObjectURL(imageBlob)];
      });

      // 로딩된 이미지를 상태에 저장하는 로직...
      const images = await Promise.all(promises);
      // images는 [boardNo, imageURL] 쌍을 포함하는 배열입니다.
      // 이를 객체로 변환하여 상태에 저장합니다.
      setReviewImages(
        images.reduce((acc, [boardNo, imageURL]) => {
          acc[boardNo] = imageURL;
          return acc;
        }, {})
      );
    };
    if (reviewList.length > 0 && !imagesLoaded) {
      loadImages();
    }
  }, [reviewList, imagesLoaded]); // 의존성 배열에 'imagesLoaded'를 추가합니다

  // 입양 상세페이지로 요청
  const goAdoptionListDetail = (desertionNo) => {
    fetch(`${API_BASE_URL}${ADOPT}/detail/${desertionNo}`)
      .then((response) => response.json())
      .then((data) => {
        fetch(`${API_BASE_URL}${ADOPT}/detail/${desertionNo}`);
        // 상세 페이지로 이동하는 로직을 추가
        // const selectedDog = adoptList.find(item => item.desertionNo === desertionNo);
        navigate(`${ADOPT}/detail/${desertionNo}`, {
          state: { adoptListDetail: data },
        });
        console.log('상세 페이지 데이터:', data);
      })
      .catch((error) => {
        console.error('상세 페이지로 이동 중 에러 발생:', error);
      });
  };

  //게시판 상세보기 요청
  const boardDetailHandler = (boardNo) => {
    const token = localStorage.getItem('ACCESS_TOKEN');

    fetch(`${API_BASE_URL}${BOARD}/detail/${boardNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        navigate(`/board/detail/${boardNo}`, {
          state: { boarddetail: data },
        });
        console.log('상세 페이지 데이터:', data);
      })
      .catch((error) => {
        console.error('상세 페이지로 이동 중 에러 발생:', error);
      });
  };

  // console.log('입양리스트 : axios 후에', adoptList);
  // console.log(reviewList);
  // console.log(boardList);

  // 로딩 상태와 컴포넌트 렌더링 부분을 분리합니다.
  let content;
  if (loading) {
    content = <LoadingPink />; // 로딩 상태이면 LoadingPink 컴포넌트를 보여주기
  } else {
    content = limitedAdoptList.map((adoptList, index) => (
      <Grid
        item
        className='image'
        key={index}
        onClick={() => goAdoptionListDetail(adoptList.desertionNo)}
      >
        <img
          src={adoptList.profileImg}
          alt='분양게시판 강아지사진'
        />
        <div className='category'>
          {adoptList.kindCd}
          {adoptList.gender === 'M' ? '수컷' : '암컷'}
          {adoptList.age}
        </div>
      </Grid>
    ));
  }
  let reviewContent;
  if (!imagesLoaded) {
    reviewContent = <LoadingPink />; // 로딩 상태이면 LoadingPink 컴포넌트를 보여주기
  } else {
    reviewContent = limitedAdoptList.map((adoptList, index) => (
      <Grid
        item
        className='image'
        key={index}
        onClick={() => goAdoptionListDetail(adoptList.desertionNo)}
      >
        <img
          src={adoptList.profileImg}
          alt='분양게시판 강아지사진'
        />
        <div className='category'>
          {adoptList.kindCd}
          {adoptList.gender === 'M' ? '수컷' : '암컷'}
          {adoptList.age}
        </div>
      </Grid>
    ));
  }

  return (
    <div className='mainWrapper'>
      <Modal
        visible={popupVisible}
        onClose={onClose}
      >
        <div className='popup'>
          <img
            src='/img/guide.png'
            alt='guide'
          />
          <div className='button-group'>
            <button onClick={onCloseToday}>하루동안 보이지 않기</button>
            <button onClick={onClose}>닫기</button>
          </div>
        </div>
      </Modal>
      <Grid
        container
        direction='column'
        className='wrap'
      >
        <Grid
          item
          className='content-1'
        >
          <ImageSlider />
        </Grid>
        <Grid
          item
          className='content-2'
        >
          <Grid
            item
            className='title-2-1'
          >
            Since 2023 <div>“Dogether”</div>대한민국에서 반려견과 함께 하고
            있습니다.
          </Grid>
        </Grid>
        <Grid
          item
          className='content-3'
        >
          <Grid className='title-3-1'>
            <span>입양게시판</span>
            <Link
              to={`${ADOPT}`}
              className='readMore'
            >
              자세히보기
            </Link>
            <hr />
            <Grid
              container
              spacing={1}
              columns={{ xs: 4, md: 12 }}
              direction='row'
              className='adoptList'
            >
              {content}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          className='content-4'
        >
          <Grid
            container
            direction='row'
            spacing={{ xs: 6 }}
          >
            <Grid
              item
              md={6}
              xs={12}
              className='title-4-1 left'
            >
              <span>Review</span>
              <Link
                to={`${BOARD}`}
                className='readMore'
              >
                자세히보기
              </Link>
              <hr />
              <div className='reviewList'>
                {reviewList.length > 0 ? (
                  reviewList.slice(0, 5).map((review, index) => (
                    <Grid
                      item
                      className='image'
                      key={index}
                    >
                      <a onClick={() => boardDetailHandler(review.boardNo)}>
                        <img
                          src={
                            reviewImages[review.boardNo] || 'default_image_url'
                          } // reviewImages에서 해당 boardNo의 이미지 URL을 찾아서 사용
                          alt='강아지후기사진'
                        />
                        <div className='category'>
                          후기 게시글 {review.title} {review.regDate}
                        </div>
                      </a>
                    </Grid>
                  ))
                ) : (
                  <Link to={`${BOARD}`}>등록된 게시글이 없습니다.</Link>
                )}
              </div>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
              className='title-4-1 right'
            >
              <span>Gallery</span>
              <Link
                to={`${BOARD}`}
                className='readMore'
              >
                자세히보기
              </Link>
              <hr />
              <div className='boardList'>
                {limitedBoardList.length > 0 ? (
                  limitedBoardList.map((boardList, index) => (
                    <Grid
                      item
                      xs={12}
                      key={index}
                    >
                      <a onClick={() => boardDetailHandler(boardList.boardNo)}>
                        <div className='category'>{boardList.category}</div>
                        <div className='title'>{boardList.title}</div>
                        <div className='regDate'>{boardList.registDate}</div>
                      </a>
                    </Grid>
                  ))
                ) : (
                  <Link to={`${BOARD}`}>등록된 게시글이 없습니다.</Link>
                )}
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default MainTemplate;
