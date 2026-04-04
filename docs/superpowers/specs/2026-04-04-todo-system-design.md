# 待办事项管理系统设计文档

## 项目概述

基于 Spring Boot 的单用户待办事项管理系统，支持任务的分类管理、优先级设置、完成度统计和搜索筛选。

## 技术栈

- Java 17+
- Spring Boot 3.x
- MySQL 8.x
- Redis
- MyBatis-Plus
- Lombok

## 核心功能

1. 任务的创建、编辑、删除
2. 自定义分类管理
3. 三级优先级（高/中/低）
4. 任务完成标记
5. 四种统计功能
6. 多维度搜索筛选
7. 操作历史记录

---

## 架构设计

采用模块化分层架构，将统计功能和审计日志独立为单独服务。

### 模块划分

```
src/main/java/com/todo/
├── controller/
│   ├── TodoController.java        # 任务 CRUD API
│   ├── CategoryController.java    # 分类 CRUD API
│   └── StatisticsController.java  # 统计数据 API
├── service/
│   ├── TodoService.java           # 任务业务逻辑
│   ├── CategoryService.java       # 分类业务逻辑
│   ├── StatisticsService.java     # 统计计算逻辑
│   ├── AuditLogService.java       # 操作日志记录
│   └── impl/                      # 实现类
├── mapper/
│   ├── TodoMapper.java
│   ├── CategoryMapper.java
│   ├── StatisticsMapper.java      # 统计相关查询
│   └── AuditLogMapper.java
├── entity/
│   ├── TodoItem.java              # 任务实体
│   ├── Category.java              # 分类实体
│   └── AuditLog.java              # 操作日志实体
├── dto/
│   ├── request/                   # 请求 DTO
│   └── response/                  # 响应 DTO（含统计结果）
├── common/
│   ├── enums/                     # Priority, Status 等枚举
│   ├── result/                    # 统一响应封装
│   └── exception/                 # 自定义异常
└── config/
    ├── RedisConfig.java           # Redis 配置
    └── MyBatisConfig.java         # MyBatis-Plus 配置
```

### 模块职责

| 模块 | 职责 |
|-----|------|
| TodoService | 任务 CRUD、状态变更、业务校验 |
| CategoryService | 分类 CRUD、默认分类初始化 |
| StatisticsService | 四种统计计算，缓存管理 |
| AuditLogService | 记录所有写操作（创建/修改/删除） |

---

## 数据库设计

### 表结构

#### category（分类表）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | BIGINT | 主键，自增 |
| name | VARCHAR(50) | 分类名称，非空 |
| sort_order | INT | 排序顺序，默认 0 |
| created_at | DATETIME | 创建时间，非空 |
| updated_at | DATETIME | 更新时间，非空 |
| is_deleted | TINYINT(1) | 逻辑删除，默认 0 |

#### todo_item（任务表）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | BIGINT | 主键，自增 |
| title | VARCHAR(200) | 任务标题，非空 |
| description | TEXT | 任务描述 |
| category_id | BIGINT | 分类ID（外键） |
| priority | TINYINT | 优先级：0-低，1-中，2-高，默认 1 |
| status | TINYINT | 状态：0-待办，1-已完成，默认 0 |
| due_date | DATETIME | 截止日期 |
| completed_at | DATETIME | 完成时间 |
| created_at | DATETIME | 创建时间，非空 |
| updated_at | DATETIME | 更新时间，非空 |
| is_deleted | TINYINT(1) | 逻辑删除，默认 0 |

#### audit_log（操作日志表）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | BIGINT | 主键，自增 |
| entity_type | VARCHAR(50) | 实体类型：TODO/CATEGORY |
| entity_id | BIGINT | 实体ID |
| action | VARCHAR(20) | 操作：CREATE/UPDATE/DELETE |
| old_value | TEXT | 变更前的值（JSON） |
| new_value | TEXT | 变更后的值（JSON） |
| operator | VARCHAR(50) | 操作者，默认 'system' |
| created_at | DATETIME | 创建时间，非空 |

### 索引设计

**todo_item 表**：
- `(category_id, status)` - 分类筛选查询
- `(priority, status)` - 优先级筛选查询
- `(due_date)` - 截止日期查询
- `(created_at)` - 时间范围筛选

**audit_log 表**：
- `(entity_type, entity_id)` - 按实体查询历史
- `(created_at)` - 时间范围查询

---

## API 设计

### 任务 API

**基础路径**：`/api/v1/todo-items`

| 方法 | URL | 功能 | 请求体 |
|------|-----|------|--------|
| POST | / | 创建任务 | TodoCreateRequest |
| PUT | /{id} | 更新任务 | TodoUpdateRequest |
| DELETE | /{id} | 删除任务 | - |
| PUT | /{id}/complete | 标记完成 | - |
| GET | /{id} | 获取单个任务 | - |
| GET | / | 列表查询 | Query Params |

**列表查询参数**：

| 参数 | 类型 | 说明 |
|-----|------|------|
| keyword | String | 关键词搜索（标题/描述） |
| categoryId | Long | 分类筛选 |
| priority | Integer | 优先级筛选（0/1/2） |
| status | Integer | 状态筛选（0/1） |
| startDate | LocalDate | 创建时间起始 |
| endDate | LocalDate | 创建时间结束 |
| page | Integer | 页码，默认 0 |
| size | Integer | 每页数量，默认 20 |

### 分类 API

**基础路径**：`/api/v1/categories`

| 方法 | URL | 功能 |
|------|-----|------|
| POST | / | 创建分类 |
| PUT | /{id} | 更新分类 |
| DELETE | /{id} | 删除分类 |
| GET | / | 获取所有分类 |

### 统计 API

**基础路径**：`/api/v1/statistics`

| 方法 | URL | 功能 | 参数 |
|------|-----|------|------|
| GET | /by-category | 按分类统计 | - |
| GET | /by-priority | 按优先级统计 | - |
| GET | /trend | 时间趋势 | period=daily/weekly, start, end |
| GET | /completion-time | 平均完成耗时 | - |

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

---

## 统计模块设计

### StatisticsService 核心方法

#### 1. 按分类统计

```java
List<CategoryStatistics> getByCategory();
```

返回数据：
- 分类名称
- 任务总数
- 已完成数
- 完成率（百分比）

#### 2. 按优先级统计

```java
List<PriorityStatistics> getByPriority();
```

返回数据：
- 优先级名称（高/中/低）
- 任务总数
- 已完成数
- 完成率
- 逾期数（截止日期已过但未完成）

#### 3. 时间趋势统计

```java
TrendStatistics getTrend(String period, LocalDate start, LocalDate end);
```

参数：
- period: daily 或 weekly
- start/end: 时间范围

返回数据：
- 时间段内每天/每周的创建数
- 时间段内每天/每周的完成数

#### 4. 平均完成耗时

```java
CompletionTimeStatistics getCompletionTime();
```

返回数据：
- 平均耗时（小时）
- 最短耗时
- 最长耗时
- 各优先级平均耗时

### Redis 缓存策略

| 统计类型 | 缓存 Key | TTL | 更新时机 |
|---------|---------|-----|---------|
| 分类统计 | stats:category | 5分钟 | 任务 CRUD |
| 优先级统计 | stats:priority | 5分钟 | 任务 CRUD |
| 时间趋势 | stats:trend:{period}:{date} | 1小时 | 查询时计算 |
| 完成耗时 | stats:completion-time | 10分钟 | 任务完成时 |

缓存实现：使用 `@Cacheable` 缓存结果，任务变更时通过 `@CacheEvict` 清除相关缓存。

---

## 审计日志设计

### AuditLogService 工作方式

**记录时机**：所有写操作自动记录
- 任务创建：记录完整初始数据
- 任务更新：记录变更前后对比（JSON）
- 任务删除：记录删除前的完整数据
- 分类操作：同上

**实现方式**：

```java
// 在 Service 实现类中调用
@Override
public void updateTodo(Long id, TodoUpdateRequest request) {
    TodoItem oldTodo = getById(id);
    TodoItem newTodo = doUpdate(id, request);
    
    auditLogService.log(
        "TODO", id, "UPDATE",
        toJson(oldTodo), toJson(newTodo)
    );
}
```

### 查询扩展

支持按实体查询历史记录：

```
GET /api/v1/todo-items/{id}/history
```

返回该任务的所有变更记录。

---

## 枚举定义

### Priority（优先级）

```java
public enum Priority {
    LOW(0, "低"),
    MEDIUM(1, "中"),
    HIGH(2, "高");
}
```

### Status（状态）

```java
public enum Status {
    PENDING(0, "待办"),
    COMPLETED(1, "已完成");
}
```

### ActionType（操作类型）

```java
public enum ActionType {
    CREATE("CREATE"),
    UPDATE("UPDATE"),
    DELETE("DELETE");
}
```

---

## 初始化数据

系统启动时自动创建默认分类：

| 分类名称 | 排序 |
|---------|------|
| 工作 | 1 |
| 生活 | 2 |
| 学习 | 3 |
| 健康 | 4 |

---

## 错误处理

### 自定义异常

| 异常类 | HTTP 状态码 | 使用场景 |
|-------|------------|---------|
| BusinessException | 400 | 业务规则校验失败 |
| ResourceNotFoundException | 404 | 资源不存在 |
| ValidationException | 400 | 参数校验失败 |

### 全局异常处理

使用 `@RestControllerAdvice` 统一处理异常，返回标准响应格式。

---

## 分页规范

使用 MyBatis-Plus 的 `Page<T>` 进行分页：

- 默认页码：0（第一页）
- 默认每页数量：20
- 最大每页数量：100

响应包含分页信息：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [...],
    "total": 100,
    "page": 0,
    "size": 20,
    "totalPages": 5
  }
}
```