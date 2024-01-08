import { React, useState, useEffect } from 'react';
import './OrderHistory.scss';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ADMIN, API_BASE_URL, PAYMENT } from '../../global/config/host-config';
import { formattedAmount, formattedDate } from '../../global/utils/AuthContext';
import axios from 'axios';

const orders = [
  {
    OrderNumber: '878787851325464578785',
    img: 'https://pethroom.com/web/product/medium/202208/6406178e3005b192086b575413018e52.jpg',
    product: '제로 워터리스 샴푸',
    cardcompany: '국민카드',
    date: '2023-01-01',
    amount: 10000,
    addr: '서울시 마포구 백범로 23 지하1층 강의실',
    paymentStatus: '접수',
  },
];
const paymentStatusMap = {
  READY: '배송중',
  IN_PROGRESS: '진행중',
  WAITING_FOR_DEPOSIT: '입금대기',
  DONE: '결제완료',
  CANCELED: '결제취소',
  PARTIAL_CANCELED: '부분취소',
  ABORTED: '승인실패',
  EXPIRED: '기간만료',
};

// , 콤마 포맷터
// , 가 나올때 마다 줄 바꿈 시켜줌
const formatComma = (productList) => {
  return productList.split(',').map((product, index) => (
    <span key={index}>
      {product}
      <br />
    </span>
  ));
};

const OrderHistory = () => {
  const [refresh, setRefresh] = useState();
  const [rejectionReason, setRejectionReason] = useState('');
  const orderPayment = (order) => {
    // productInfo에서 orderId가 order.OrderNumber와 같은 항목들을 필터링

    const matchingProductInfos = productInfo.filter(
      (productInfo) => productInfo.orderId === order.OrderNumber
    );

    // 필터링된 항목들을 순회하며 HTML 생성
    const orderDetailsHtml = matchingProductInfos
      .map(
        (productInfo) => `
    <div class="order-details">
      <img src="${productInfo.img}" alt="상품 이미지" class="product-image">
      <p>상품명: ${productInfo.title}</p>
      <p>상품 설명: ${productInfo.subtitle}</p>
      <p>상품 수량: ${productInfo.totalCount} 개</p>
      <p>상품 가격: ${productInfo.totalPrice} 원</p>
    </div>
  `
      )
      .join('');

    Swal.fire({
      html: `
      <div class= "swal_title">
        결제 내역
        <p class="order-number">주문번호: ${order.OrderNumber}</p>
        <p class="order-number">주문 날짜: ${formattedDate(order.date)}</p>
      </div>
      ${orderDetailsHtml}
    `,
      width: 600,
      padding: '3em',
      color: '#000000',
      backdrop: `
      rgba(0, 0, 0, 0.3)
      no-repeat
    `,
      confirmButtonText: '확인', // confirm 버튼 텍스트 지정
    });
  };

  const handleCancelPayment = (order) => {
    console.log(order);
    Swal.fire({
      title: '결제 취소하시겠습니까?',
      html: `
     
   <div class="order-details">
       <img src="${order.img}" alt="상품 이미지" class="product-image">
       <p class="order-number">주문번호: ${order.OrderNumber}</p>
       <p>주문 날짜: ${order.date}</p>
       <p>상품명: ${order.product}</p>
       <p>결제 비용: ${order.amount}원</p>
       <p>배송지 정보<br> ${order.addr}원</p>
      
   </div>
`,
      icon: 'warning',
      confirmButtonText: '결제취소',
    }).then((result) => {
      // 만약 Promise리턴을 받으면,
      if (result.isConfirmed) {
        // 만약 모달창에서 결제 취소 버튼을 눌렀다면
        if (result.isConfirmed) {
          // 만약 모달창에서 결제 취소 버튼을 눌렀다면
          console.log(
            ` 삭제 요청 경로 ==== ${API_BASE_URL}${PAYMENT}/${order.OrderNumber}`
          );
          axios
            .delete(`${API_BASE_URL}${PAYMENT}/${order.OrderNumber}`, {
              headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
              },
            })
            .then((response) => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'center-center',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer);
                  toast.addEventListener('mouseleave', Swal.resumeTimer);
                },
              });
              Toast.fire({
                icon: 'success',
                title: '결제 취소가 진행중입니다.',
              });
              window.location.reload();
            });
        }
      }
    });
  };

  // Payment 결제내역 목록 불러오기
  const [paymentResponse, setPaymentResponse] = useState([]);
  const [productInfo, setProductInfo] = useState([]);
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${PAYMENT}`, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        console.log(data);

        setPaymentResponse(data.paymentResponse);
        setProductInfo(data.productInfos);

        // orders 배열에 데이터들을 쌓는 코드
        let newOrders = [];
        for (let i = 0; i < data.paymentResponse.length; i++) {
          let payment = data.paymentResponse[i];
          let product = data.productInfos.find(
            (p) => p.orderId === payment.orderId
          );

          newOrders.push({
            OrderNumber: payment.orderId,
            img: product ? product.img : '',
            product: payment.orderName,
            cardcompany: payment.method,
            date: payment.approvedAt,
            amount: payment.totalAmount,
            addr: '서울시 마포구 백범로 23 지하1층 강의실', // 주소 정보는 API에서 받아올 수 없으므로, 임의의 값으로 설정하였습니다.
            paymentStatus: payment.status,
          });
        }
        setOrders(newOrders); // useState를 사용하여 orders 상태를 관리하세요.
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // 관리자의 거절 사유 가져오기
  const fetchRejectionReason = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${PAYMENT}/canceled/${orderId}`, // 올바른 엔드포인트로 교체
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
          },
        }
      );

      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다');
      }

      const data = await response.json();

      // 응답 JSON이 'reasonsRefusal' 필드를 가지고 있다고 가정합니다.
      const reasonsRefusal = data.reasonsRefusal;

      Swal.fire({
        title: '거절 사유',
        text: reasonsRefusal,
        icon: 'error',
        confirmButtonText: '확인',
      });
    } catch (error) {
      console.error('거절 사유를 가져오는 중 오류 발생:', error);
      Swal.fire('에러가 발생했습니다.', '', 'error');
    }
  };

  return (
    <>
      <div className='mypage-fixed'>
        <div className='group-wrapper'>
          <div className='group'>
            <button className='mypage-tap'>
              <Link to='/user/mypage'>마이페이지</Link>
            </button>
            <button className='modify-tap'>
              <Link to='/user/modify'>개인정보변경</Link>
            </button>
            <button className='adoptionstatus'>
              <Link to='/user/adoptionstatus'>입양신청현황</Link>
            </button>
            <button className='like-list-tap'>
              <Link to='/user/likelist'>좋아요목록</Link>
            </button>
            <button className='order-history'>
              <Link to='/user/orderhistory'>주문 현황</Link>
            </button>

            <div className='ProductOrderList'>
              <div className='boardTitle'>주문 목록</div>
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center' }}>장바구니가 비어있어요</p>
              ) : (
                <>
                  <table className='orderhistory_table'>
                    <thead>
                      <tr className='orderHistory_tr'>
                        <th>이미지</th>
                        <th>상품 정보</th>
                        <th>주문일자</th>
                        <th>주문금액</th>
                        <th>결제상태</th>
                        <th>결제관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.OrderNumber}>
                          <td>
                            <img
                              src={order.img}
                              alt='게시물 이미지'
                              style={{ width: '100px', height: '100px' }}
                            />
                          </td>
                          <td className='order-product'>
                            {formatComma(order.product)}
                          </td>
                          <td className='order-date'>
                            {formatComma(formattedDate(order.date))}
                          </td>
                          <td>{formattedAmount(order.amount)}</td>
                          <td
                          // onClick={() =>
                          //   fetchRejectionReason(order.OrderNumber)
                          // }
                          >
                            {paymentStatusMap[order.paymentStatus]}
                          </td>
                          <td>
                            <button
                              className='orderButton'
                              onClick={() => orderPayment(order)}
                            >
                              결제 내역
                            </button>
                            <button
                              className='cancelButton'
                              onClick={() => handleCancelPayment(order)}
                            >
                              결제 취소
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
