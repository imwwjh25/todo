-- H2 测试数据库初始化脚本

-- 分类表
CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
);

-- 任务表
CREATE TABLE IF NOT EXISTS todo_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    title VARCHAR(200) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    category_id BIGINT COMMENT '分类ID',
    priority TINYINT DEFAULT 1 COMMENT '优先级：0-低，1-中，2-高',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待办，1-已完成',
    due_date TIMESTAMP COMMENT '截止日期',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    entity_type VARCHAR(50) NOT NULL COMMENT '实体类型',
    entity_id BIGINT NOT NULL COMMENT '实体ID',
    action VARCHAR(20) NOT NULL COMMENT '操作类型',
    old_value TEXT COMMENT '变更前的值（JSON）',
    new_value TEXT COMMENT '变更后的值（JSON）',
    operator VARCHAR(50) DEFAULT 'system' COMMENT '操作者',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 初始化默认分类
INSERT INTO category (name, sort_order) VALUES
('工作', 1),
('生活', 2),
('学习', 3),
('健康', 4);