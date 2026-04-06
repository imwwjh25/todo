package com.todo.controller;

import com.todo.common.result.Result;
import com.todo.dto.request.LoginRequest;
import com.todo.dto.response.LoginResponse;
import com.todo.dto.response.UserInfoResponse;
import com.todo.service.UserService;
import com.todo.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return Result.success(response);
        } catch (RuntimeException e) {
            return Result.error(401, e.getMessage());
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/user")
    public Result<UserInfoResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        if (token == null || !jwtUtil.validateToken(token)) {
            return Result.error(401, "未登录或登录已过期");
        }

        Long userId = jwtUtil.getUserId(token);
        if (userId == null) {
            return Result.error(401, "无效的 Token");
        }

        UserInfoResponse user = userService.getUserById(userId);
        return Result.success(user);
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        // JWT 无状态，前端清除 Token 即可
        return Result.success();
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}