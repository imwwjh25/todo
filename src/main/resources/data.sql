-- 待办事项管理系统初始化数据
-- 示例任务数据

-- 插入示例任务（分类ID基于 schema.sql 中的默认分类：1-工作, 2-生活, 3-学习, 4-健康）
INSERT INTO todo_item (title, description, category_id, priority, status, due_date, created_at, updated_at) VALUES
('完成项目文档', '编写项目技术文档，包括架构设计和API说明', 1, 2, 0, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
('学习 Spring Boot', '完成 Spring Boot 基础教程，掌握核心概念', 3, 1, 0, DATE_ADD(NOW(), INTERVAL 14 DAY), NOW(), NOW()),
('每日锻炼', '保持健康的生活习惯，每天运动30分钟', 4, 0, 0, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW()),
('代码审查', '审查团队成员提交的代码，确保代码质量', 1, 2, 0, DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW()),
('购买生活用品', '周末去超市购买日常生活用品', 2, 1, 0, DATE_ADD(NOW(), INTERVAL 5 DAY), NOW(), NOW()),
('阅读技术书籍', '阅读《深入理解Java虚拟机》第三章', 3, 1, 0, DATE_ADD(NOW(), INTERVAL 10 DAY), NOW(), NOW()),
('定期体检', '预约下周的健康体检', 4, 2, 1, DATE_ADD(NOW(), INTERVAL -3 DAY), NOW(), NOW()),
('完成单元测试', '为统计功能编写单元测试用例', 1, 2, 1, DATE_ADD(NOW(), INTERVAL -1 DAY), NOW(), NOW()),
('整理房间', '周末大扫除，整理书架和衣柜', 2, 0, 1, DATE_ADD(NOW(), INTERVAL -2 DAY), NOW(), NOW()),
('学习 Redis', '了解 Redis 缓存的使用场景和最佳实践', 3, 1, 0, DATE_ADD(NOW(), INTERVAL 20 DAY), NOW(), NOW());