package org.nthuli_shop.nthuli_shop.Authentication.dto;
import org.nthuli_shop.nthuli_shop.Authentication.entity.Role;

public class RegisterRequest {
    private String email;
    private String password;
    private Role role;

    public RegisterRequest() {}
    public RegisterRequest(String email, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    //getters and setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
