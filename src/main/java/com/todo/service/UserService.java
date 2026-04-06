package com.todo.service;

import com.todo.dto.request.LoginRequest;
import com.todo.dto.response.LoginResponse;
import com.todo.dto.response.UserInfoResponse;

/**
 * 用户服务接口
 */
public interface UserService {
    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request);

    /**
     * 根据用户名查询用户
     */
    UserInfoResponse getUserByUsername(String username);

    /**
     * 根据用户 ID 查询用户
     */
    UserInfoResponse getUserById(Long id);
}