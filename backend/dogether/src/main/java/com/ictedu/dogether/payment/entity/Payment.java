package com.ictedu.dogether.payment.entity;

import com.ictedu.dogether.ownproduct.entity.Product;
import com.ictedu.dogether.payment.dto.PaymentStatus;
import com.ictedu.dogether.userapi.entity.User;
import lombok.*;

import javax.persistence.*;
import java.util.List;

@Entity
@Getter
@Setter
@ToString(exclude = "user")
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payment")
public class Payment {
    @Id
    @Setter
    @Column(name = "order_id", nullable = false, unique = true)
    private String orderId;                 // 주문 고유 번호

    @Column(name = "order_name", nullable = false)
    private String orderName;               // 주문 명

    @Column(name = "amount", nullable = false)
    private String amount;                    // 주문 가격

    @Column(name = "payment_key",nullable = false)
    private String paymentKey;			    // 결제 고유 번호

    @Column(name = "method",nullable = false)
    private String method;                  // 지불 수단

    @Column(name = "status",nullable = false)

    @Enumerated(EnumType.ORDINAL)
    private PaymentStatus status;              // 결제 상태

    @Setter
    @Column(updatable = false)
    private String requestedAt;              // 요청시간

    @Setter
    @Column(updatable = false)
    private String approvedAt;              // 요청시간

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private User user;                  // 유저 정보

    @Setter
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private CardInfo card;                  // 카드 정보

    @Column(name = "payment_canceled")
    private String reasonsRefusal; // 거절 사유

    @Setter
    @OneToMany(mappedBy = "orderId", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<PaymentDetail> paymentDetails;




}