package com.ictedu.dogether.userapi.dto.request;

import lombok.Data;

@Data
public class NaverToken {
    private String access_token;
    private String refresh_token;
    private String token_type;
    private int expires_in;
}
