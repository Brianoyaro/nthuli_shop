package org.nthuli_shop.nthuli_shop.Authentication.dto;

import org.nthuli_shop.nthuli_shop.Authentication.entity.Role;

public class RolePromotionRequest {
    private Role role;

    public RolePromotionRequest() {}

    public RolePromotionRequest(Role role) {
        this.role = role;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
