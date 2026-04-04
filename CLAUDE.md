# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

待办事项管理系统（Todo Management System）- 基于 Spring Boot 的任务管理应用

### 技术栈
- **框架**: Java 17+ / Spring Boot 3.x
- **数据库**: MySQL 8.x
- **缓存**: Redis
- **ORM**: MyBatis-Plus
- **工具**: Lombok

### 核心功能
- 待办事项的创建、编辑、删除
- 任务分类和优先级设置
- 任务完成度统计
- 任务搜索和筛选

## 常用命令

### 构建和运行
```bash
# 编译项目
./mvnw clean compile

# 运行测试
./mvnw test

# 运行单个测试类
./mvnw test -Dtest=TodoServiceTest

# 运行单个测试方法
./mvnw test -Dtest=TodoServiceTest#testCreateTodo

# 打包项目
./mvnw clean package -DskipTests

# 运行应用
./mvnw spring-boot:run

# 指定配置文件运行
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 数据库相关
```bash
# 执行数据库迁移（如使用 Flyway）
./mvnw flyway:migrate

# 生成 MyBatis-Plus 代码
./mvnw mybatis-plus:generator
```

### 代码质量
```bash
# 代码格式化
./mvnw spotless:apply

# 静态检查
./mvnw checkstyle:check
```

## 项目结构

```
src/main/java/com/todo/
├── controller/          # REST API 控制器
├── service/             # 业务逻辑层
│   └── impl/            # 服务实现
├── mapper/              # MyBatis-Plus Mapper 接口
├── entity/              # 数据库实体类
├── dto/                 # 数据传输对象
│   ├── request/         # 请求 DTO
│   └── response/        # 响应 DTO
├── config/              # 配置类（Redis、Swagger、Security 等）
├── common/              # 公共组件
│   ├── exception/       # 自定义异常
│   ├── enums/           # 枚举类
│   └── result/          # 统一响应封装
└── util/                # 工具类

src/main/resources/
├── application.yml          # 主配置文件
├── application-dev.yml       # 开发环境配置
├── application-prod.yml      # 生产环境配置
└── mapper/                   # MyBatis XML 映射文件
```

## 架构规范

### 分层架构
- **Controller**: 接收请求，参数校验，调用 Service，返回响应
- **Service**: 业务逻辑处理，事务控制
- **Mapper**: 数据访问，继承 MyBatis-Plus BaseMapper

### 代码规范
- 所有文档、注释、变量名使用中文或英文，注释必须使用中文
- 实体类使用 `@TableName` 注解指定表名
- 使用 Lombok 减少样板代码（`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`）
- Controller 返回统一的 `Result<T>` 响应对象

### API 设计
- RESTful 风格
- URL 使用小写，单词用连字符分隔：`/api/v1/todo-items`
- HTTP 方法语义：GET 查询，POST 创建，PUT 更新，DELETE 删除

### 数据库设计
- 表名使用下划线命名：`todo_item`, `category`
- 主键使用 `id`，BIGINT 类型
- 必须包含 `created_at`, `updated_at` 字段
- 逻辑删除字段：`is_deleted`

### 缓存策略
- Redis 缓存热点数据
- 缓存 key 命名：`todo:{模块}:{id}`
- 使用 `@Cacheable`, `@CacheEvict` 注解管理缓存

## Git 分支管理

- `main`: 生产环境代码
- `develop`: 开发主分支
- `feature/*`: 功能开发分支
- `bugfix/*`: Bug 修复分支
- `release/*`: 发布分支