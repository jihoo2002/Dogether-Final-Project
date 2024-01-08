import React, { useEffect, useState } from 'react';
import './Quiz.scss';
import { useNavigate } from 'react-router-dom';
import { LuDog } from 'react-icons/lu';
import axios from 'axios';
import { API_BASE_URL, USER } from '../../global/config/host-config';

const Quiz = () => {
  // 마이페이지에 점수 띄우기
  const myScore = useNavigate();

  const getUserIdFromLocalStorage = () => {
    return localStorage.getItem('USER_ID');
  };

  const [userId, setUserId] = useState(getUserIdFromLocalStorage());

  //현재 질문 변경
  const [question, setQuestion] = useState(0);

  //퀴즈 결과 가져오기
  const [showResult, setShowResult] = useState(false);

  //점수 가져오기
  const [score, setScore] = useState(0);

  const [nyaHoProgress, setNyaHoProgress] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  
  localStorage.setItem('SCORE', score);
  // 퀴즈 점수 저장
  const scoreSave = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${USER}/knowledges/quiz?score=${score * 10}`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error('퀴즈 결과 저장 중 에러 발생:', error);
    }
  };
  const questions = [
    {
      text: '강아지가 살기 적합한 공간은?',
      options: [
        { id: 0, text: '답답한 공간', isCorrect: false },
        { id: 1, text: '시끄러운 공간', isCorrect: false },
        { id: 2, text: '자유롭게 움직일 수 있는 공간 ', isCorrect: true },
      ],
    },
    {
      text: '매월 정기적으로 예방접종을 해야 하는 것은?',
      options: [
        {
          id: 0,
          text: '심장 사상충',
          isCorrect: true,
        },
        {
          id: 2,
          text: '코로나 장염',
          isCorrect: false,
        },
        {
          id: 3,
          text: '인플루엔자',
          isCorrect: false,
        },
      ],
    },
    {
      text: '반려견 우울증에 대해 옳은 것은?',
      options: [
        { id: 0, text: '반려견은 우울증에 걸리지 않는다', isCorrect: false },
        {
          id: 1,
          text: '갑작스런 이사로 우울증에 걸릴 수 있다',
          isCorrect: true,
        },
        {
          id: 2,
          text: '우을증은 행동 교육으로는 치료할 수 없다',
          isCorrect: false,
        },
      ],
    },
    {
      text: '반려견을 유기하면 받는 처벌 사항은? (맹견 제외)',
      options: [
        { id: 0, text: '300만원 이하의 벌금이 부과된다', isCorrect: true },
        {
          id: 1,
          text: '100만원 이하의 과태료 처분을 받는다',
          isCorrect: false,
        },
        { id: 2, text: '법적 처벌을 받지 않는다 ', isCorrect: false },
      ],
    },
    {
      text: '반려견 입양 첫날 행동으로 바람직한 것은?',
      options: [
        {
          id: 0,
          text: '입양 전 강아지가 썻던 담요를 준비한다',
          isCorrect: true,
        },
        { id: 1, text: '활발한 어린이들과 같이 놀게 한다', isCorrect: false },
        { id: 2, text: '배변 훈련을 시작한다', isCorrect: false },
      ],
    },
    {
      text: '반려동물등록을 필수로 해야 하는 시기는?',
      options: [
        { id: 0, text: '월령 1개월 이상 ', isCorrect: false },
        { id: 1, text: '월령 3개월 이상 ', isCorrect: false },
        { id: 2, text: '월령 2개월 이상', isCorrect: true },
      ],
    },
    {
      text: '반려동물과 자동차 탑승 시 주의사항은?',
      options: [
        {
          id: 0,
          text: '반려동물이 차 안에 움직이게 하는 게 좋다 ',
          isCorrect: false,
        },
        {
          id: 1,
          text: '반려동물을 손으로 안고 운전해도 된다 ',
          isCorrect: false,
        },
        { id: 2, text: '반려동물을 안은 채 운전하면 안된다', isCorrect: true },
      ],
    },
    {
      text: '반려동물이 먹으면 위험한 음식은?',
      options: [
        { id: 0, text: '당근 ', isCorrect: false },
        { id: 1, text: '사과 ', isCorrect: false },
        { id: 2, text: '초콜릿', isCorrect: true },
      ],
    },
    {
      text: '반려견 임신 중 주의사항이 아닌 것은?',
      options: [
        {
          id: 0,
          text: '목욕 시 배를 압박하지 않도록 조심한다 ',
          isCorrect: false,
        },
        { id: 1, text: '계단을 오르내리는 일을 주의한다 ', isCorrect: false },
        {
          id: 2,
          text: '임신 중에는 꼭 구충약을 복용해야 한다',
          isCorrect: true,
        },
      ],
    },
    {
      text: '반려견을 잘 칭찬하는 방법이 아닌 것은?',
      options: [
        { id: 0, text: '낮은 목소리로 오랫동안 이야기하기 ', isCorrect: true },
        { id: 1, text: '맛있는 간식 주기 ', isCorrect: false },
        { id: 2, text: '함께 산책하기', isCorrect: false },
      ],
    },
  ];

  // 사용자가 문제 답을 선택 했을 때
  const optionClicked = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    if (question + 1 < questions.length) {
      setQuestion(question + 1);
      setNyaHoProgress(nyaHoProgress + 10);
    } else {
      setShowResult(true);
    }
  };
  const restart = () => {
    setScore(0);
    setQuestion(0);
    setShowResult(false);
    setNyaHoProgress(0);
  };

  // 정답 보기 모달창

  const quizModal = () => {
    setOpenModal(true);
  };

  // 정답 보기 모달창 닫기
  const closeModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    setOpenModal(false);
  }, []);
  //결과화면볼때
  useEffect(() => {
    if (showResult) {
      scoreSave();
    }
  }, [showResult]);

  return (
    //App
    <div className='quiz'>
      {showResult ? (
        <>
          <div className='result'>
            <h1>최종결과</h1>
            <h2>{score * 10} 점</h2>
            <span className='result-score'>70점</span>
            <span> 이상은 수료가 가능합니다. </span>
          </div>
          <button
            className='result-btn'
            onClick={restart}
          >
            다시풀기
          </button>
          <button
            className='isCorrect-btn'
            onClick={quizModal}
          >
            정답보기
          </button>
          {openModal && (
            <>
              <div className='background'></div>
              <div className='modal-group'>
                <div className='wrap-modal'>
                  <h2 className='title'>
                    정답이다
                    <LuDog className='icon' />
                  </h2>
                  <div className='content'>
                    <p className='check-info'>정답을 확인해보세요</p>
                    <ul className='answer-list'>
                      <li className='list-content'>
                        <p>
                          1. 반려견은 자유롭게 움직일 수 있는 공간에서 살기
                          적합하다
                        </p>
                      </li>

                      <li className='list-content'>
                        <p>
                          2. 매월 정기적으로 예방접종을 해야 하는 것은
                          심장사상충
                        </p>
                      </li>

                      <li className='list-content'>
                        <p>
                          3. 반려견은 갑작스러운 이사로 인해 우울증에 걸릴 수
                          있다
                        </p>
                      </li>

                      <li className='list-content'>
                        <p>
                          4. 반려동물을 유기하면 300만원 이하의 벌금이
                          부과된다(맹견 제외)
                        </p>
                      </li>

                      <li className='list-content'>
                        <p>
                          5. 유기견 입양 첫날 입양 전 강아지가 썻던 담요를
                          준비하는 게 좋다
                        </p>
                      </li>

                      <li className='list-content'>
                        <p>
                          6. 월령 2개월 이상인 반려동물은 반려동물 등록을
                          해야한다
                        </p>
                      </li>

                      <li className='list-content'>
                        <p>7. 반려동물을 안은 채 운전하면 안된다</p>
                      </li>

                      <li className='list-content'>
                        <p>8. 반려견이 먹으면 위험한 음식은 초콜릿</p>
                      </li>

                      <li className='list-content'>
                        <p>9. 반려견 임신 중 구충약을 복용하면 안된다</p>
                      </li>

                      <li className='list-content'>
                        <p>
                          10. 낮은 목소리로 오랫동안 이야기하는 건 반려견을 잘
                          칭찬하는 방법이 아니다
                        </p>
                      </li>
                    </ul>
                  </div>
                  <button
                    className='close-btn'
                    onClick={closeModal}
                  >
                    X
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className='quiz-card'>
          <h2 className='question-num'>{question + 1} </h2>
          <h3>{questions[question].text} </h3>

          <ul>
            {questions[question].options.map((option) => {
              return (
                <li
                  onClick={() => optionClicked(option.isCorrect)}
                  key={option.id}
                >
                  {option.text}
                </li>
              );
            })}
          </ul>
          <div className='area-box'>
            <div className='out-box'>
              <span
                className='item-pro'
                style={{ width: `${nyaHoProgress}%` }}
              ></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
