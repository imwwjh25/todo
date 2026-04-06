# 登录功能设计文档

## 概述

为待办事项管理系统添加登录功能，采用单用户模式 + JWT Token 认证，前端延续 Apple Store 设计风格。

## 需求确认

| 项目 | 决定 |
|------|------|
| 用户模式 | 单用户系统，仅需管理员账号 |
| 认证方式 | JWT Token，存储在前端 localStorage |
| UI 风格 | Apple Store 设计风格 |
| 账号设置 | 预置管理员账号 |

---

## 1. 数据库设计

新增 `user` 表：

```sql
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- BCrypt 加密存储
    nickname VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0
);
```

预置管理员账号：
- 用户名：`admin`
- 密码：`admin123`（BCrypt 加密后存储）
- 昵称：`管理员`

---

## 2. 后端架构

### 2.1 新增文件

**实体层**
- `src/main/java/com/todo/entity/User.java`

**DTO 层**
- `src/main/java/com/todo/dto/request/LoginRequest.java`
- `src/main/java/com/todo/dto/response/LoginResponse.java`
- `src/main/java/com/todo/dto/response/UserInfoResponse.java`

**工具类**
- `src/main/java/com/todo/util/JwtUtil.java`
- `src/main/java/com/todo/util/PasswordUtil.java`

**Service 层**
- `src/main/java/com/todo/service/UserService.java`
- `src/main/java/com/todo/service/impl/UserServiceImpl.java`

**Controller 层**
- `src/main/java/com/todo/controller/AuthController.java`

**拦截器**
- `src/main/java/com/todo/config/AuthInterceptor.java`
- 更新 `WebMvcConfig.java` 注册拦截器

### 2.2 JWT 配置

在 `application.yml` 中添加：
```yaml
jwt:
  secret: your-secret-key-at-least-256-bits-long
  expiration: 86400000  # 24小时（毫秒）
```

### 2.3 拦截器配置

拦截所有 `/api/v1/**` 路径，排除：
- `/api/v1/auth/login`
- `/api/v1/auth/logout`

---

## 3. 前端设计

### 3.1 新增文件

- `src/main/resources/static/login.html` - 登录页面

### 3.2 登录页面设计

采用 Apple Store 设计风格：
- 居中的白色卡片（暗色模式下为深色）
- 圆角输入框（8px radius）
- 蓝色登录按钮（Apple 蓝 #0071E3）
- 品牌标识在顶部

### 3.3 路由守卫

`index.html` 启动时：
1. 检查 localStorage 中的 `auth_token`
2. 无 Token 或 Token 过期 → 跳转 `login.html`
3. 有有效 Token → 正常显示

### 3.4 导航栏更新

- 显示用户昵称
- 添加退出按钮（点击清除 Token 并跳转登录页）

### 3.5 API 请求更新

所有 API 调用添加 Header：
```javascript
Authorization: Bearer ${localStorage.getItem('auth_token')}
```

---

## 4. API 设计

### 4.1 接口列表

| 方法 | 路径 | 认证 | 功能 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 无 | 登录验证，返回 JWT Token |
| GET | `/api/v1/auth/user` | 需要 | 获取当前登录用户信息 |
| POST | `/api/v1/auth/logout` | 无 | 退出登录（前端清除 Token 即可） |

### 4.2 请求/响应格式

**登录请求**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**登录响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "nickname": "管理员"
  }
}
```

**用户信息响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员"
  }
}
```

### 4.3 认证失败响应

Token 无效或过期返回 401：
```json
{
  "code": 401,
  "message": "未登录或登录已过期"
}
```

---

## 5. 依赖说明

需要新增依赖（pom.xml）：
- `spring-boot-starter-security`（仅用于 BCryptPasswordEncoder）
- `io.jsonwebtoken:jjwt-api:0.11.5`
- `io.jsonwebtoken:jjwt-impl:0.11.5`
- `io.jsonwebtoken:jjwt-jackson:0.11.5`

---

## 6. 实现顺序

1. 数据库迁移脚本（user 表）
2. 后端实体、DTO、工具类
3. Service 和 Controller
4. 拦截器配置
5. 前端登录页面
6. 前端路由守卫和导航栏更新
7. 测试验证