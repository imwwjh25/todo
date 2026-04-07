# 待办事项管理系统 (Todo Management System)

基于 Spring Boot 3.x 的待办事项管理应用，提供完整的任务管理、分类管理、统计分析功能。

## 功能特性

### 核心功能
- **待办事项管理**：创建、编辑、删除、标记完成
- **任务分类**：自定义分类管理
- **优先级设置**：高、中、低三级优先级
- **截止日期**：支持设置任务截止时间
- **操作历史**：记录任务变更历史

### 统计分析
- **分类统计**：按分类汇总任务数量
- **优先级统计**：按优先级统计完成情况
- **趋势分析**：按日期查看任务完成趋势
- **完成时间统计**：平均完成时间分析

### 用户认证
- 用户登录/注册
- JWT Token 认证
- 密码加密存储

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17+ | 开发语言 |
| Spring Boot | 3.1.5 | 应用框架 |
| MySQL | 8.x | 关系数据库 |
| Redis | - | 缓存服务 |
| MyBatis-Plus | 3.5.7 | ORM 框架 |
| Lombok | 1.18.36 | 简化代码 |
| JWT (jjwt) | 0.11.5 | 认证方案 |

## 项目结构

```
src/main/java/com/todo/
├── controller/              # REST API 控制器
│   ├── TodoController.java
│   ├── CategoryController.java
│   ├── StatisticsController.java
│   └── AuthController.java
├── service/                 # 业务逻辑层
│   └── impl/                # 服务实现
├── mapper/                  # MyBatis-Plus Mapper
├── entity/                  # 数据库实体
│   ├── TodoItem.java
│   ├── Category.java
│   ├── User.java
│   └── AuditLog.java
├── dto/                     # 数据传输对象
│   ├── request/             # 请求 DTO
│   └── response/            # 响应 DTO
├── config/                  # 配置类
│   ├── RedisConfig.java
│   ├── MyBatisConfig.java
│   ├── WebMvcConfig.java
│   └── AuthInterceptor.java
├── common/                  # 公共组件
│   ├── enums/               # 枚举类
│   ├── exception/           # 异常处理
│   └── result/              # 统一响应
└── util/                    # 工具类
    ├── JwtUtil.java
    └── PasswordUtil.java
```

## 快速开始

### 环境要求
- JDK 17+
- MySQL 8.x
- Redis
- Maven 3.6+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd todo-management
```

2. **创建数据库**
```sql
CREATE DATABASE todo_management;
```

3. **配置数据库连接**

编辑 `src/main/resources/application-dev.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/todo_management?useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

4. **配置 Redis**

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

5. **运行项目**
```bash
./mvnw spring-boot:run
```

服务将在 `http://localhost:8082` 启动。

## API 文档

### 待办事项 API

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `/api/v1/todo-items` | 创建待办事项 |
| PUT | `/api/v1/todo-items/{id}` | 更新待办事项 |
| DELETE | `/api/v1/todo-items/{id}` | 删除待办事项 |
| PUT | `/api/v1/todo-items/{id}/complete` | 标记完成 |
| GET | `/api/v1/todo-items/{id}` | 获取详情 |
| GET | `/api/v1/todo-items/{id}/history` | 获取历史记录 |
| GET | `/api/v1/todo-items` | 查询列表（支持分页、筛选） |

### 分类 API

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `/api/v1/categories` | 创建分类 |
| PUT | `/api/v1/categories/{id}` | 更新分类 |
| DELETE | `/api/v1/categories/{id}` | 删除分类 |
| GET | `/api/v1/categories` | 获取分类列表 |

### 统计 API

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/statistics/by-category` | 分类统计 |
| GET | `/api/v1/statistics/by-priority` | 优先级统计 |
| GET | `/api/v1/statistics/trend` | 趋势分析 |
| GET | `/api/v1/statistics/completion-time` | 完成时间统计 |

### 认证 API

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `/api/v1/auth/login` | 用户登录 |
| POST | `/api/v1/auth/register` | 用户注册 |
| GET | `/api/v1/auth/user-info` | 获取用户信息 |

### 查询参数示例

待办事项查询支持以下参数：
```
GET /api/v1/todo-items?page=1&size=10&status=1&priority=2&categoryId=1&keyword=任务
```

## 开发指南

### 常用命令

```bash
# 编译项目
./mvnw clean compile

# 运行测试
./mvnw test

# 运行单个测试
./mvnw test -Dtest=TodoServiceTest

# 打包项目
./mvnw clean package -DskipTests

# 运行应用
./mvnw spring-boot:run

# 指定配置文件运行
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 代码规范

- 实体类使用 `@TableName` 指定表名
- 使用 Lombok 减少样板代码
- Controller 返回统一的 `Result<T>` 响应
- URL 使用 RESTful 风格，小写连字符分隔

### 数据库设计规范

- 表名使用下划线命名：`todo_item`, `category`
- 主键使用 `id`，BIGINT 类型自增
- 必须包含 `created_at`, `updated_at` 字段
- 逻辑删除字段：`is_deleted`

## 配置说明

### 环境配置

| 文件 | 用途 |
|------|------|
| `application.yml` | 主配置 |
| `application-dev.yml` | 开发环境 |
| `application-prod.yml` | 生产环境 |

### 主要配置项

```yaml
server:
  port: 8082

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: isDeleted

jwt:
  secret: <your-secret-key>
  expiration: 86400000  # 24小时
```

## Git 分支管理

| 分支 | 说明 |
|------|------|
| `main` | 生产环境代码 |
| `develop` | 开发主分支 |
| `feature/*` | 功能开发分支 |
| `bugfix/*` | Bug 修复分支 |
| `release/*` | 发布分支 |

## License

MIT License