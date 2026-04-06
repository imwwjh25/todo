# 登录功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为待办事项管理系统添加单用户登录功能，使用 JWT Token 认证，前端延续 Apple Store 设计风格。

**Architecture:** 新建 User 表 + JWT 工具类 + 认证拦截器 + 独立登录页面。后端采用拦截器验证 Token，前端使用 localStorage 存储 Token 并在请求头携带。

**Tech Stack:** Spring Boot 3.x, MyBatis-Plus, JJWT 0.11.5, BCrypt (via Spring Security crypto), Apple Store Design System

---

## 文件结构

**新增文件：**
- `src/main/java/com/todo/entity/User.java` - 用户实体
- `src/main/java/com/todo/mapper/UserMapper.java` - 用户 Mapper
- `src/main/java/com/todo/dto/request/LoginRequest.java` - 登录请求 DTO
- `src/main/java/com/todo/dto/response/LoginResponse.java` - 登录响应 DTO
- `src/main/java/com/todo/dto/response/UserInfoResponse.java` - 用户信息响应 DTO
- `src/main/java/com/todo/util/JwtUtil.java` - JWT 工具类
- `src/main/java/com/todo/util/PasswordUtil.java` - 密码加密工具
- `src/main/java/com/todo/service/UserService.java` - 用户服务接口
- `src/main/java/com/todo/service/impl/UserServiceImpl.java` - 用户服务实现
- `src/main/java/com/todo/controller/AuthController.java` - 认证控制器
- `src/main/java/com/todo/config/AuthInterceptor.java` - 认证拦截器
- `src/main/java/com/todo/config/WebMvcConfig.java` - Web MVC 配置
- `src/main/resources/db/migration/V1__Create_User_Table.sql` - 数据库迁移脚本
- `src/main/resources/static/login.html` - 登录页面

**修改文件：**
- `pom.xml` - 添加 JWT 和 Spring Security crypto 依赖
- `src/main/resources/application.yml` - 添加 JWT 配置
- `src/main/resources/static/index.html` - 导航栏添加用户信息和退出按钮
- `src/main/resources/static/app.js` - 添加认证相关函数和路由守卫

---

### Task 1: 添加 Maven 依赖

**Files:**
- Modify: `pom.xml`

- [ ] **Step 1: 添加 JWT 和 Spring Security crypto 依赖**

在 `<dependencies>` 标签内添加：

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security Crypto (仅用于 BCryptPasswordEncoder) -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

- [ ] **Step 2: 验证依赖添加成功**

Run: `./mvnw dependency:resolve -DincludeScope=compile | grep -E 'jjwt|spring-security-crypto'`
Expected: 显示 jjwt 和 spring-security-crypto 相关依赖

- [ ] **Step 3: Commit**

```bash
git add pom.xml
git commit -m "chore: 添加 JWT 和 Spring Security crypto 依赖"
```

---

### Task 2: 创建数据库迁移脚本

**Files:**
- Create: `src/main/resources/db/migration/V1__Create_User_Table.sql`

- [ ] **Step 1: 创建迁移脚本目录**

Run: `mkdir -p src/main/resources/db/migration`

- [ ] **Step 2: 编写迁移脚本**

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入预置管理员账号
-- 密码 'admin123' 的 BCrypt 加密值
INSERT INTO user (username, password, nickname) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员');
```

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/migration/V1__Create_User_Table.sql
git commit -m "feat: 添加用户表数据库迁移脚本"
```

---

### Task 3: 创建 User 实体类

**Files:**
- Create: `src/main/java/com/todo/entity/User.java`

- [ ] **Step 1: 编写 User 实体类**

```java
package com.todo.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

/**
 * 用户实体
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Boolean isDeleted;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/entity/User.java
git commit -m "feat: 添加 User 实体类"
```

---

### Task 4: 创建 UserMapper

**Files:**
- Create: `src/main/java/com/todo/mapper/UserMapper.java`

- [ ] **Step 1: 编写 UserMapper 接口**

```java
package com.todo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.todo.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 Mapper 接口
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/mapper/UserMapper.java
git commit -m "feat: 添加 UserMapper 接口"
```

---

### Task 5: 创建 DTO 类

**Files:**
- Create: `src/main/java/com/todo/dto/request/LoginRequest.java`
- Create: `src/main/java/com/todo/dto/response/LoginResponse.java`
- Create: `src/main/java/com/todo/dto/response/UserInfoResponse.java`

- [ ] **Step 1: 编写 LoginRequest**

```java
package com.todo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 登录请求 DTO
 */
@Data
public class LoginRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;
}
```

- [ ] **Step 2: 编写 LoginResponse**

```java
package com.todo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String nickname;
}
```

- [ ] **Step 3: 编写 UserInfoResponse**

```java
package com.todo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户信息响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Long id;
    private String username;
    private String nickname;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/todo/dto/request/LoginRequest.java \
        src/main/java/com/todo/dto/response/LoginResponse.java \
        src/main/java/com/todo/dto/response/UserInfoResponse.java
git commit -m "feat: 添加登录相关 DTO 类"
```

---

### Task 6: 创建密码加密工具类

**Files:**
- Create: `src/main/java/com/todo/util/PasswordUtil.java`

- [ ] **Step 1: 编写 PasswordUtil**

```java
package com.todo.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码加密工具类
 */
public class PasswordUtil {
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * 加密密码
     */
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/util/PasswordUtil.java
git commit -m "feat: 添加密码加密工具类"
```

---

### Task 7: 创建 JWT 工具类

**Files:**
- Create: `src/main/java/com/todo/util/JwtUtil.java`

- [ ] **Step 1: 编写 JwtUtil**

```java
package com.todo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具类
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成 JWT Token
     */
    public String generateToken(Long userId, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 解析 Token 获取 Claims
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从 Token 获取用户 ID
     */
    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        if (claims == null) return null;
        Object userId = claims.get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        return (Long) userId;
    }

    /**
     * 从 Token 获取用户名
     */
    public String getUsername(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * 验证 Token 是否有效
     */
    public boolean validateToken(String token) {
        Claims claims = parseToken(token);
        if (claims == null) return false;
        return !claims.getExpiration().before(new Date());
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/util/JwtUtil.java
git commit -m "feat: 添加 JWT 工具类"
```

---

### Task 8: 添加 JWT 配置到 application.yml

**Files:**
- Modify: `src/main/resources/application.yml`

- [ ] **Step 1: 添加 JWT 配置**

在文件末尾添加：

```yaml
jwt:
  secret: TodoMasterSecretKeyForJwtTokenGenerationMustBeAtLeast256Bits
  expiration: 86400000  # 24小时（毫秒）
```

- [ ] **Step 2: Commit**

```bash
git add src/main/resources/application.yml
git commit -m "config: 添加 JWT 配置"
```

---

### Task 9: 创建 UserService

**Files:**
- Create: `src/main/java/com/todo/service/UserService.java`
- Create: `src/main/java/com/todo/service/impl/UserServiceImpl.java`

- [ ] **Step 1: 编写 UserService 接口**

```java
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
```

- [ ] **Step 2: 编写 UserServiceImpl 实现类**

```java
package com.todo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.todo.dto.request.LoginRequest;
import com.todo.dto.response.LoginResponse;
import com.todo.dto.response.UserInfoResponse;
import com.todo.entity.User;
import com.todo.mapper.UserMapper;
import com.todo.service.UserService;
import com.todo.util.JwtUtil;
import com.todo.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 用户服务实现
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 验证密码
        if (!PasswordUtil.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 生成 Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return LoginResponse.builder()
                .token(token)
                .nickname(user.getNickname())
                .build();
    }

    @Override
    public UserInfoResponse getUserByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        return UserInfoResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();
    }

    @Override
    public UserInfoResponse getUserById(Long id) {
        User user = userMapper.selectById(id);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        return UserInfoResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/todo/service/UserService.java \
        src/main/java/com/todo/service/impl/UserServiceImpl.java
git commit -m "feat: 添加 UserService 用户服务"
```

---

### Task 10: 创建 AuthController

**Files:**
- Create: `src/main/java/com/todo/controller/AuthController.java`

- [ ] **Step 1: 编写 AuthController**

```java
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
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/controller/AuthController.java
git commit -m "feat: 添加 AuthController 认证控制器"
```

---

### Task 11: 创建认证拦截器

**Files:**
- Create: `src/main/java/com/todo/config/AuthInterceptor.java`

- [ ] **Step 1: 编写 AuthInterceptor**

```java
package com.todo.config;

import com.todo.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 认证拦截器
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // OPTIONS 请求直接放行
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录或登录已过期\",\"data\":null}");
            return false;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"登录已过期\",\"data\":null}");
            return false;
        }

        // 将用户 ID 存入请求属性
        Long userId = jwtUtil.getUserId(token);
        request.setAttribute("userId", userId);

        return true;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/config/AuthInterceptor.java
git commit -m "feat: 添加 AuthInterceptor 认证拦截器"
```

---

### Task 12: 创建 WebMvcConfig 配置类

**Files:**
- Create: `src/main/java/com/todo/config/WebMvcConfig.java`

- [ ] **Step 1: 编写 WebMvcConfig**

```java
package com.todo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/v1/**")
                .excludePathPatterns(
                        "/api/v1/auth/login",
                        "/api/v1/auth/logout",
                        "/api/v1/auth/user"  // 此接口在 Controller 内单独验证
                );
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/todo/config/WebMvcConfig.java
git commit -m "feat: 添加 WebMvcConfig 配置拦截器"
```

---

### Task 13: 创建前端登录页面

**Files:**
- Create: `src/main/resources/static/login.html`

- [ ] **Step 1: 编写 login.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TodoMaster - 登录</title>
    <style>
        :root {
            --bg-primary: #F5F5F7;
            --bg-surface: #FFFFFF;
            --text-primary: #1D1D1F;
            --text-muted: rgba(0,0,0,0.56);
            --accent: #0071E3;
            --accent-hover: #0077ED;
            --border-input: #D2D2D7;
            --border-focus: var(--accent);
            --danger: #FF3B30;
            --radius-sm: 8px;
            --radius-md: 18px;
            --radius-button: 12px;
            --focus-ring: 0 0 0 3px rgba(0,113,227,0.25);
            --shadow-modal: 0 8px 32px rgba(0,0,0,0.12);
            --font-text: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
            --font-body: 17px;
            --font-small: 14px;
        }

        [data-theme="dark"] {
            --bg-primary: #000000;
            --bg-surface: #1D1D1F;
            --text-primary: #F5F5F7;
            --text-muted: rgba(255,255,255,0.56);
            --accent: #2997FF;
            --accent-hover: #3A9FFF;
            --border-input: #333336;
            --border-focus: var(--accent);
            --danger: #FF3B30;
            --shadow-modal: 0 8px 32px rgba(255,255,255,0.12);
            --focus-ring: 0 0 0 3px rgba(41,151,255,0.25);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html {
            font-size: var(--font-body);
            -webkit-font-smoothing: antialiased;
        }

        body {
            font-family: var(--font-text);
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .login-container {
            width: 100%;
            max-width: 400px;
            margin: 20px;
        }

        .login-card {
            background: var(--bg-surface);
            border-radius: var(--radius-md);
            padding: 40px 32px;
            box-shadow: var(--shadow-modal);
        }

        .login-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .login-logo {
            width: 48px;
            height: 48px;
            color: var(--accent);
            margin-bottom: 12px;
        }

        .login-title {
            font-size: 28px;
            font-weight: 600;
            color: var(--text-primary);
            letter-spacing: -0.28px;
        }

        .login-subtitle {
            font-size: var(--font-small);
            color: var(--text-muted);
            margin-top: 8px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: var(--font-small);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 6px;
        }

        .form-input {
            width: 100%;
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-input);
            padding: 12px 14px;
            border-radius: var(--radius-sm);
            font-family: var(--font-text);
            font-size: var(--font-body);
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
        }

        .form-input:focus {
            border-color: var(--border-focus);
            box-shadow: var(--focus-ring);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 12px 24px;
            font-family: var(--font-text);
            font-size: var(--font-body);
            font-weight: 400;
            border: none;
            border-radius: var(--radius-button);
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .btn-primary {
            background: var(--accent);
            color: #FFFFFF;
        }

        .btn-primary:hover {
            background: var(--accent-hover);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .error-message {
            color: var(--danger);
            font-size: var(--font-small);
            text-align: center;
            margin-bottom: 16px;
            display: none;
        }

        .error-message.show {
            display: block;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <svg class="login-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                <h1 class="login-title">TodoMaster</h1>
                <p class="login-subtitle">待办事项管理系统</p>
            </div>

            <p id="error-message" class="error-message"></p>

            <form id="login-form" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="username" class="form-label">用户名</label>
                    <input type="text" id="username" name="username" class="form-input" placeholder="请输入用户名" required>
                </div>
                <div class="form-group">
                    <label for="password" class="form-label">密码</label>
                    <input type="password" id="password" name="password" class="form-input" placeholder="请输入密码" required>
                </div>
                <button type="submit" id="login-btn" class="btn btn-primary">登录</button>
            </form>
        </div>
    </div>

    <script>
        // 初始化主题
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (prefersDark ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        }

        initTheme();

        // 处理登录
        async function handleLogin(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('error-message');
            const btn = document.getElementById('login-btn');

            btn.disabled = true;
            btn.textContent = '登录中...';
            errorEl.classList.remove('show');

            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.code === 200) {
                    localStorage.setItem('auth_token', data.data.token);
                    localStorage.setItem('user_nickname', data.data.nickname);
                    window.location.href = 'index.html';
                } else {
                    errorEl.textContent = data.message || '登录失败';
                    errorEl.classList.add('show');
                }
            } catch (error) {
                errorEl.textContent = '网络错误，请重试';
                errorEl.classList.add('show');
            } finally {
                btn.disabled = false;
                btn.textContent = '登录';
            }
        }
    </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/main/resources/static/login.html
git commit -m "feat: 添加 Apple Store 风格登录页面"
```

---

### Task 14: 更新 index.html 导航栏

**Files:**
- Modify: `src/main/resources/static/index.html`

- [ ] **Step 1: 在导航栏添加用户信息和退出按钮**

找到 `<div class="nav-actions">` 部分（约第 894 行），替换为：

```html
<div class="nav-actions">
    <span id="user-nickname" class="nav-user" style="font-size:14px; color:var(--text-secondary); margin-right:8px"></span>
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="切换主题">
        <svg id="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg id="theme-icon-moon" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
    </button>
    <button id="logout-btn" class="btn btn-ghost btn-sm" onclick="handleLogout()" aria-label="退出登录">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>退出</span>
    </button>
    <button class="btn btn-primary btn-sm" onclick="openAddTaskModal()" aria-label="快速添加任务">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>添加任务</span>
    </button>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/main/resources/static/index.html
git commit -m "feat: 更新导航栏添加用户信息和退出按钮"
```

---

### Task 15: 更新 app.js 添加认证功能

**Files:**
- Modify: `src/main/resources/static/app.js`

- [ ] **Step 1: 更新 API_BASE 常量和添加认证状态**

在文件开头（约第 1-10 行），修改为：

```javascript
// TodoMaster - 待办事项管理系统前端应用
// API 基础路径
const API_BASE = '/api/v1';

// 全局状态
let categories = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let currentFilters = {};
let currentUser = null;  // 当前用户信息
```

- [ ] **Step 2: 添加认证相关函数**

在 `// ==================== Theme Management ====================` 之前添加：

```javascript
// ==================== Authentication Functions ====================

/**
 * 检查登录状态，未登录则跳转到登录页
 */
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * 初始化用户信息
 */
async function initUser() {
    const nickname = localStorage.getItem('user_nickname');
    const nicknameEl = document.getElementById('user-nickname');
    if (nickname && nicknameEl) {
        nicknameEl.textContent = nickname;
    }

    // 验证 Token 是否有效
    try {
        currentUser = await apiGet('/auth/user');
        if (nicknameEl) {
            nicknameEl.textContent = currentUser.nickname || currentUser.username;
        }
    } catch (error) {
        // Token 无效，跳转登录页
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
    }
}

/**
 * 退出登录
 */
function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_nickname');
    window.location.href = 'login.html';
}
```

- [ ] **Step 3: 更新 API Helper 函数添加认证 Header**

将 `apiGet`、`apiPost`、`apiPut`、`apiDelete` 函数修改为携带认证 Header：

```javascript
async function apiGet(endpoint) {
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiPost(endpoint, body) {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiPut(endpoint, body) {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiDelete(endpoint) {
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers
    });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}
```

- [ ] **Step 4: 更新初始化函数**

将 DOMContentLoaded 事件处理函数修改为：

```javascript
// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (!checkAuth()) return;

    initTheme();
    initUser();
    loadDashboard();
});
```

- [ ] **Step 5: Commit**

```bash
git add src/main/resources/static/app.js
git commit -m "feat: 添加前端认证功能和路由守卫"
```

---

### Task 16: 执行数据库迁移并测试

**Files:**
- 无文件变更，测试验证

- [ ] **Step 1: 执行数据库迁移**

手动执行迁移脚本（MySQL 客户端或命令行）：

```bash
mysql -u root -p todo_db < src/main/resources/db/migration/V1__Create_User_Table.sql
```

或者直接在 MySQL 中执行：

```sql
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user (username, password, nickname) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员');
```

- [ ] **Step 2: 启动应用**

Run: `./mvnw spring-boot:run`

Expected: 应用启动成功，无报错

- [ ] **Step 3: 测试登录功能**

1. 打开浏览器访问 `http://localhost:8080/login.html`
2. 输入用户名 `admin`，密码 `admin123`
3. 点击登录按钮
4. Expected: 成功跳转到 `index.html`，导航栏显示"管理员"

- [ ] **Step 4: 测试退出功能**

1. 在主页点击"退出"按钮
2. Expected: 跳转回登录页，localStorage 中的 Token 被清除

- [ ] **Step 5: 测试认证拦截**

1. 清除 localStorage 后直接访问 `http://localhost:8080/index.html`
2. Expected: 自动跳转到登录页

---

### Task 17: 最终 Commit

- [ ] **Step 1: 检查所有改动**

Run: `git status`

Expected: 所有文件已提交，无未提交的改动

- [ ] **Step 2: 查看提交历史**

Run: `git log --oneline -10`

Expected: 显示本次登录功能的完整提交链

---

## 完成标准

1. 数据库 user 表已创建，预置管理员账号可正常登录
2. JWT Token 认证机制正常工作
3. 登录页面采用 Apple Store 设计风格
4. 未登录访问主页会自动跳转登录页
5. 导航栏显示用户昵称，退出按钮功能正常
6. 所有 API 请求携带 Authorization Header