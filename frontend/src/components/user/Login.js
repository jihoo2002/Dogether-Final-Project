import React, { useContext, useState } from 'react';
import './Login.scss';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../global/utils/AuthContext.js';
import { API_BASE_URL } from '../../global/config/host-config.js';
import { KAKAO_AUTH_URL } from '../../global/kakaoAuth.js';

import { ErrorAlert, ErrorAlert2 } from '../../global/Alerts.js';
import { setAppElement } from 'react-modal';
const Login = () => {
  const redirection = useNavigate();
  const { onLogin } = useContext(AuthContext);

  const toLink = (loc) => {
    redirection(loc);
  };

  const [userId, setUserId] = useState('');
  const [userPass, setUserPass] = useState('');

  const [loginText, setLoginText] = useState('');

  // 서버에 로그인 요청
  const fetchLogin = async () => {
    const $userId = document.getElementById('id');
    const $userPass = document.getElementById('password');
    try {
      const res = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: $userId.value,
          userPass: $userPass.value,
        }),
      });

      if (res.status === 200) {
        const data = await res.json();
        console.log('서버 응답 ', data);
        const { token, role } = data;

        localStorage.setItem('ACCESS_TOKEN', token);
        onLogin(token, role);
        redirection('/');
      } else {
        const text = await res.text();
        console.log('로그인 실패', text);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginText('');
    if (!userId) {
      setLoginText('아이디를 입력해주세요');
      return;
    } else if (!userPass) {
      setLoginText('비밀번호를 입력해주세요');
      return;
    }

    console.log('userId:', userId, 'userPass:', userPass);
    try {
      // 로그인 요청하기
      await fetchLogin();
      console.log('로그인 요청이 들어옴! ');
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  return (
    <div className='wrapper'>
      <div className='loginTemplate1'>
        <div className='loginDogether'>Dogether</div>
        <form onSubmit={handleLogin}>
          <input
            type='text'
            id='id'
            name='id'
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder='아이디를 입력해주세요'
          />

          <br />
          <input
            type='password'
            id='password'
            name='password'
            value={userPass}
            onChange={(e) => setUserPass(e.target.value)}
            placeholder='비밀번호를 입력해주세요.'
          />
          <div className='error-message'>
            <p>{loginText}</p>
          </div>
          <button
            type='submit'
            className='loginbtn'
          >
            로그인
          </button>
          <div className='haha'>
            <img
              className='kakaobtnimg'
              src='/img/kakaoLoginBtn.png'
              alt='kakaoLogin'
              onClick={() => {
                window.location.href = KAKAO_AUTH_URL;
              }}
            />
            <img
              className='naverbtnimg'
              src='/img/naverLoginBtn.png'
              alt='naverlogin'
            />
          </div>
          <div className='account'>
            <span
              className='findid'
              onClick={() => toLink('/user/findid')}
            >
              아이디 찾기
            </span>
            <span
              className='findpass'
              onClick={() => toLink('/user/findpassword')}
            >
              비밀번호 찾기
            </span>
            <span
              className='tojoin'
              onClick={() => toLink('/user/join')}
            >
              회원가입 하기
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
