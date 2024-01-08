package com.ictedu.dogether.payment.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.ictedu.dogether.adoptContract.dto.request.RejectedRequestDTO;
import com.ictedu.dogether.auth.TokenUserInfo;
import com.ictedu.dogether.ownproduct.entity.Product;
import com.ictedu.dogether.ownproduct.service.productService;
import com.ictedu.dogether.payment.dto.*;
import com.ictedu.dogether.payment.entity.PaymentDetail;
import com.ictedu.dogether.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;

import javax.crypto.SecretKey;
import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/payment")
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService; // 결제 서비스
    private final productService productservice; // 제품 서비스

    // Payment 유저 결제 내역 확인
    @GetMapping
    public ResponseEntity<?> getPaymentList(@AuthenticationPrincipal TokenUserInfo userInfo) {
        log.info("\n\n\n\n 전달된 토큰 확인해서 아이디 == {} 랑 role == {}을 뽑아 봅시다",userInfo.getUserId(),userInfo.getRole());
        try {
            UserPaymentResponse paymentList = paymentService.getPaymentList(userInfo);
            // 성공적인 경우
            return ResponseEntity.ok().body(paymentList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // Payment 결제 승인
    @PostMapping
    public ResponseEntity<?> confirmPayment(@RequestHeader(value="SecretKey") String SecretKey
            , @AuthenticationPrincipal TokenUserInfo userInfo
            , @RequestBody PaymentRequest paymentRequest) {
            log.info("\n\n\n\n\n 컨트롤러에 POST 요청 들어옴 SecretKey={} \n\n paymentRequest={} \n\n paymentRequest.getProductInfo()={} \n\n TokenUserInfo 가 이렇게 옴={} \n\n TokenUserInfo.getUserId 가 이렇게 옴={}"
                    ,SecretKey,paymentRequest, paymentRequest.getProductInfo(), userInfo,userInfo.getUserId());
        try {
            PaymentResponse response = paymentService.confirmPayment(paymentRequest, SecretKey, userInfo.getUserId());

            // 성공적인 경우
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // Payment 결제 내역 삭제, 곰곰히 생각해보니까 결제를 취소 한다고 결제 내역이 삭제 되면 안되잖아.
    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> confirmPayment(@PathVariable("orderId") String orderId,
                                            @AuthenticationPrincipal TokenUserInfo userInfo) {
        try {
            log.info(userInfo.getUserId());
            paymentService.deletePayment(orderId, userInfo);

            // 성공적인 경우
            return ResponseEntity.ok().build(); //성공하면 200
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    // 주문 결제 상태 변경 로직 DONE --> CANCELED
    @PostMapping("/canceled/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> paymentCanceled(@RequestBody PaymentCanceled dto,
                                           @AuthenticationPrincipal TokenUserInfo userInfo
    ) {
        log.info("payment컨트롤러 /canceled 요청 들어옴");
        try {
            paymentService.paymentCanceled(dto, userInfo);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }

    }

    //주문 결제 상태 변경 로직 DONE --> READY
    @PostMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminPaymentApproved(
            @AuthenticationPrincipal TokenUserInfo userInfo,
            @PathVariable String orderId) {
        log.info("\n\n\n 주문 결제 상태 변경 로직 DONE --> READY 컨트롤러 요청 들어옴", userInfo, orderId);
        try {
            paymentService.paymentReady(userInfo, orderId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}
