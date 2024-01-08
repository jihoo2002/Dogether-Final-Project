package com.ictedu.dogether.ownproduct.entity;

import com.ictedu.dogether.payment.entity.PaymentDetail;
import lombok.*;

import javax.persistence.*;
import java.util.List;

@Getter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@Entity

@Table(name = "dogetherproduct")
public class Product {

    @Id
    @Column(name = "product_id")
    private int productId;


    private String title;

    private String subtitle;

    private String price;

    private String img;

    @Setter
    @OneToMany(mappedBy = "products", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<PaymentDetail> paymentDetails;

}
