package org.nthuli_shop.nthuli_shop.Authentication.dto;

public class RefreshTokenRequest {
    private String token;

    public RefreshTokenRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return this.token;
    }
    public void setToken(String token) {
        this.token = token;
    }

    @Override
    public String toString() {
        return "RefreshTokenRequest{" +
                "token='" + this.token + '\'' +
                '}';
    }
}
