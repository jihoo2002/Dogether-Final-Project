import React, { useEffect, useState } from 'react';
import { API_BASE_URL, USER } from '../config/host-config';
import { format } from 'date-fns';

// 새로운 전역 컨텍스트 생성
const AuthContext = React.createContext({
  isLoggedIn: false, // 로그인 했는지의 여부 추적
  userName: '',
  onLogout: () => {},
  onLogin: (userId, userPass) => {},
});

// 위에서 생성한 Context를 제공할 수 있는 provider
// 이 컴포넌트를 통해 자식 컴포넌트에게 인증 상태와 관련된 함수들을 전달할 수 있음.
export const AuthContextProvider = (props) => {
  console.log('AuthContextProvider called');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem('LOGIN_USERNAME')
  );
  const [role, setRole] = useState(localStorage.getItem('USER_ROLE'));
  const [token, setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
  const [loading, setLoading] = useState(true);

  // 컴포넌트가 렌더링 될 때 localStorage에서 로그인 정보를 가지고 와서 상태를 설정.
  useEffect(() => {
    // console.log('AuthContext useEffect called');
    const testFunction = async () => {
      // console.log(
      //   'AuthContext useEffect token: ',
      //   localStorage.getItem('ACCESS_TOKEN')
      // );
      const requestHeader = {
        'content-type': 'application/json',
        // JWT에 대한 인증 토큰이라는 타입을 선언
        Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
      };

      const res = await fetch(API_BASE_URL + USER + '/status', {
        method: 'GET',
        headers: requestHeader,
      });
      // console.log('status: ', res.status);
      if (res.status === 401) {
        // console.log('토큰값 유효하지 않음!');
        localStorage.clear();
      }
      setLoading(false);
      setIsLoggedIn(false);
    };
    //testFunction();
    if (localStorage.getItem('isLoggedIn')) {
      setIsLoggedIn(true);
    }
  }, []);

  //로그아웃 핸들러
  const logoutHandler = () => {
    // 'dontShowToday' 값을 임시로 저장
    const dontShowTodayValue = localStorage.getItem('dontShowToday');

    // 로컬스토리지 내용 전체 삭제
    localStorage.clear();

    // 'dontShowToday'의 값만 다시 저장
    if (dontShowTodayValue) {
      localStorage.setItem('dontShowToday', dontShowTodayValue);
    }

    setIsLoggedIn(false);
    setUserName('');
  };

  // 로그인 핸들러
  const loginHandler = (token, role, userEmail, userName, userId) => {
    // console.log('세션 저장요청이들어옴');
    // console.log('token : ', token);
    // console.log('role: ', role);

    localStorage.setItem('isLoggedIn', '1');
    //json에 담긴 인증정보를 클라이언트에 보관
    // 1. 로컬 스토리지 - 브라우저가 종료되어도 보관됨.
    // 2. 세션 스토리지 - 브라우저가 종료되면 사라짐.
    localStorage.setItem('ACCESS_TOKEN', token);
    localStorage.setItem('USER_ROLE', role);
    localStorage.setItem('USER_EMAIL', userEmail);
    localStorage.setItem('USER_NAME', userName);
    localStorage.setItem('USER_ID', userId);

    setIsLoggedIn(true);
    setUserName(userName);
    setRole(role);
    // console.log(role);
  };

  // 관리자 여부 확인
  const isAdminFlag = () => role === 'ADMIN';
  // console.log('role: ', role);
  // 카카오 로그인 핸들러
  // const kakaoLogin = (token, userEmail, role) => {
  //   localStorage.setItem('isLoggedIn', '1');
  //   //json에 담긴 인증정보를 클라이언트에 보관
  //   // 1. 로컬 스토리지 - 브라우저가 종료되어도 보관됨.
  //   // 2. 세션 스토리지 - 브라우저가 종료되면 사라짐.
  //   localStorage.setItem('ACCESS_TOKEN', token);
  //   // localStorage.setItem('LOGIN_USERNAME', userName);
  //   localStorage.setItem('USER_EMAIL', userEmail);
  //   localStorage.setItem('USER_ROLE', role);
  //   setIsLoggedIn(true);
  //   setUserName(userName);
  // };

  // console.log('AuthContext의 마지막 부분');
  // console.log('isAdminFlag: ', isAdminFlag());

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        loading,
        isAdmin: isAdminFlag(),
        onLogout: logoutHandler,
        onLogin: loginHandler,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const formattedDate = (dateString) => {
  return format(new Date(dateString), 'yyyy-MM-dd');
};

export const formattedAmount = (amount) => {
  return Number(amount).toLocaleString() + '원';
};

export default AuthContext;
