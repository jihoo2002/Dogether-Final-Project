import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, PAYMENT, USER } from '../../global/config/host-config';
import './PaymentSuccess.scss';
import LoadingPink from '../../global/LoadingPink';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem('cartItems'))
  );
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem('USER_INFO'))
  );

  const [paymentData, setPaymentData] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestData = {
      orderId: searchParams.get('orderId'),
      orderName: decodeURIComponent(searchParams.get('orderName')),
      amount: searchParams.get('amount'),
      paymentKey: searchParams.get('paymentKey'),
      userId: userInfo.userId,
      productInfo: cartItems,
    };
    // TODO: 개발자센터에 로그인해서 내 결제위젯 연동 키 > 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
    // @docs https://docs.tosspayments.com/reference/using-api/api-keys
    const secretKey = process.env.REACT_APP_PAYMENTS_SERECT_KEY;

    // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
    // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
    // @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
    const encryptedSecretKey = `Basic ${btoa(secretKey + ':')}`;

    // async function confirm() {
    //   const response = await fetch(
    //     'https://api.tosspayments.com/v1/payments/confirm',
    //     {
    //       method: 'POST',
    //       headers: {
    //         Authorization: encryptedSecretKey,
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify(requestData),
    //     }
    //   );

    console.log('전달받은 requestData', requestData);
    async function confirm() {
      const response = await fetch(`${API_BASE_URL}${PAYMENT}`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
          SecretKey: encryptedSecretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const json = await response.json();
      // 상태 업데이트
      setPaymentData(json);

      if (!response.ok) {
        // TODO: 구매 실패 비즈니스 로직 구현
        console.log(json);
        navigate(`/paymentfail?code=${json.code}&message=${json.message}`);
        return;
      }

      // TODO: 구매 완료 비즈니스 로직 구현
      console.log('요청받은 JSON : ', json);
      setLoading(false);
    }
    confirm();
  }, []);

  // paymentData에 데이터가 쌓이면 사용한 로컬스토리지 삭제
  useEffect(() => {
    if (paymentData) {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('userId');
      localStorage.removeItem('quantityMap');
      localStorage.removeItem('@tosspayments/client-id');
    }
  }, [paymentData]);

  const redirection = useNavigate();
  const ToMainhome = () => {
    redirection('/');
  };
  const ToOrderHistory = () => {
    redirection(`${USER}/orderhistory`);
  };
  let userName = localStorage.getItem('USER_NAME');
  if (userName === null) {
    userName = '사용자';
  }
  // 로딩 상태와 컴포넌트 렌더링 부분을 분리합니다.
  let content;
  if (loading) {
    content = <LoadingPink />; // 로딩 상태이면 LoadingPink 컴포넌트를 보여주기
  } else {
    content = (
      <div className='box_section'>
        <h2 style={{ padding: '20px 0px 10px 0px' }}>
          <img
            width='35px'
            src='https://static.toss.im/3d-emojis/u1F389_apng.png'
            alt='축하 이미지 '
          />
          {userName}님 결제가 완료 되었습니다.
          <img
            width='35px'
            src='https://static.toss.im/3d-emojis/u1F389_apng.png'
            alt='축하 이미지 '
          />
        </h2>
        <div className='payment-result-wrapper'>
          <p>{`주문이름 : ${paymentData.orderName}`}</p>
          <p>{`결제수단 : ${paymentData.method}`}</p>

          <p>{`결제일 : ${paymentData.approvedAt}`}</p>
          <br />
          <div className='buttonSection'>
            <button onClick={ToMainhome}>메인홈으로</button>
            <button onClick={ToOrderHistory}>결제 내역</button>
          </div>
        </div>
      </div>
    );
  }
  return <div className='payment-result-wrapper'>{content}</div>;
}

export default PaymentSuccess;
