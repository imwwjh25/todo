# TodoMaster Apple 风格 UI 重构设计文档

## 概述

将 TodoMaster 待办事项管理系统前端界面重构为 Apple 设计风格，支持深浅双模式切换。

## 设计目标

- 采用 Apple 深色模式设计语言：深黑背景、玻璃态导航栏、圆角按钮、卡片阴影
- 支持深色/浅色双模式切换，默认跟随系统偏好
- 使用 Inter 字体，与 Apple SF Pro 设计一致
- 完全采用 Apple 配色：黑白灰为主，Apple Blue 为交互色

## 技术方案

采用 CSS 变量驱动的设计系统，与 Tailwind CSS 结合，实现优雅的主题切换。

---

## 设计系统变量

### 颜色变量

#### 浅色模式（默认）

```css
--bg-primary: #f5f5f7;           /* 页面主背景 */
--bg-surface: #ffffff;           /* 卡片/面板背景 */
--bg-nav: rgba(255,255,255,0.8); /* 导航栏玻璃态 */
--text-primary: #1d1d1f;         /* 主文字 */
--text-secondary: rgba(0,0,0,0.8);   /* 次级文字 */
--text-muted: rgba(0,0,0,0.48);      /* 辅助文字 */
--accent: #0071e3;               /* Apple Blue - 主交互色 */
--border: rgba(0,0,0,0.1);       /* 边框 */
```

#### 深色模式

```css
--bg-primary: #000000;           /* 纯黑背景 */
--bg-surface: #1d1d1f;           /* 主表面 */
--bg-surface-1: #272729;         /* 卡片层级1 */
--bg-surface-2: #28282a;         /* 卡片层级2 */
--bg-surface-3: #2a2a2d;         /* 卡片层级3 */
--bg-nav: rgba(0,0,0,0.88);      /* 导航栏 */
--text-primary: #f5f5f7;         /* 主文字 */
--text-secondary: rgba(255,255,255,0.8);  /* 次级文字 */
--text-muted: rgba(255,255,255,0.48);     /* 辅助文字 */
--accent: #2997ff;               /* Bright Blue - 深色模式链接 */
--border: rgba(255,255,255,0.1); /* 边框 */
```

#### 功能色

```css
--success: #34c759;   /* 完成状态、低优先级 */
--warning: #ff9500;   /* 中优先级 */
--danger: #ff3b30;    /* 高优先级、错误 */
```

### 字体变量

```css
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
--font-text: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
```

### 间距与圆角

```css
--radius-sm: 8px;      /* 按钮、输入框 */
--radius-md: 12px;     /* 卡片、弹窗 */
--radius-lg: 16px;     /* 大卡片 */
--radius-pill: 980px;  /* 药丸按钮 */
```

### 阴影

```css
--shadow-card: rgba(0,0,0,0.5) 3px 5px 30px 0px;  /* 深色卡片悬浮阴影 */
--shadow-card-light: rgba(0,0,0,0.08) 0 2px 8px;  /* 浅色卡片阴影 */
--focus-ring: 0 0 0 3px rgba(41,151,255,0.25);    /* 聚焦外发光 */
```

---

## 组件样式规范

### 导航栏

- 固定顶部 `sticky top-0`
- 高度 48px，左右 padding 32px
- 玻璃态效果：`backdrop-filter: saturate(180%) blur(20px)`
- 深色：背景 `rgba(0,0,0,0.88)`
- 浅色：背景 `rgba(255,255,255,0.8)`，底部 1px 边框
- 元素：Logo + 导航 Tab + 主题切换按钮 + 快速添加按钮

### 按钮

| 类型 | 样式规格 |
|------|----------|
| 主按钮 | Apple Blue 背景，白色文字，圆角 980px，padding 8px 22px |
| 次按钮 | 透明背景，蓝色边框 1px，圆角 980px |
| 导航按钮 | 圆角 980px，字体 12px，padding 4px 12px |
| 添加按钮 | 深色：亮白背景 #f5f5f7；浅色：蓝色背景 |
| 媒体按钮 | 圆形 36px，半透明背景 `rgba(60,60,67,0.64)` |

按钮 hover 效果：opacity 降至 0.88，过渡时间 150ms

### 卡片

- 圆角 12px
- 深色：背景层级表面色（surface-1/2/3），hover 显示阴影
- 浅色：白色背景，浅灰边框，hover 显示阴影
- padding 24-32px
- 内部标题 28px/400，正文 14px

### 输入框与表单

- 圆角 8px
- padding 10px 14px
- 深色：背景 `#1c1c1e`，边框 `#333336`
- 浅色：背景 `#fafafc`，边框 `#d2d2d7`
- 聚焦状态：蓝色边框 + 3px 外发光
- 错误状态：红色边框 (#ff453a) + 外发光

### Modal 弹窗

- 全屏遮罩：`rgba(60,60,67,0.64)`
- 弹窗内容：圆角 12px
- 深色：背景 `#1d1d1f`
- 浅色：背景 `#ffffff`
- 最大宽度 480px，居中显示

### 任务项

- 完成勾选按钮：圆形，未完成时显示边框，完成时显示蓝色背景 + 白色勾选图标
- 标题：17px，完成的任务 opacity 降至 50%
- 状态标签：圆角 980px，完成绿色，待完成橙色
- 优先级标签：高红色，中橙色，低绿色

---

## 页面布局规范

### 整体布局

- 主内容区：`max-width: 980px` 居中
- 响应式断点：768px 以下导航链接隐藏，padding 减至 20px

### 仪表板视图

- 统计卡片：4 列网格（响应式 1→2→4）
- 最近任务：单列列表，紧凑样式
- 图表：2 列，优先级圆环图 + 分类堆叠柱状图

### 任务列表视图

- 筛选栏：搜索框（flex-1）+ 3 个筛选下拉，横向排列
- 任务列表：单列，每项包含勾选、标题、元信息、操作按钮
- 分页：居中，上一页/页码/下一页按钮

### 分类管理视图

- 新建按钮：页面顶部
- 分类网格：3 列响应式（1→2→3）
- 分类卡片：名称 + 描述 + 任务数 + 编辑/删除按钮

### 统计分析视图

- 日期选择：起始 + 结束输入框 + 查询按钮
- 图表网格：2 列 4 个图表

---

## 主题切换机制

### 切换按钮

- 位置：导航栏右侧，添加按钮之前
- 图标：太阳/月亮 SVG，切换显示
- 悬浮提示："切换到深色模式" / "切换到浅色模式"

### 实现逻辑

1. 页面加载时检测：`localStorage.getItem('theme')` 或系统偏好 `prefers-color-scheme`
2. 通过 `data-theme` 属性切换：`document.documentElement.setAttribute('data-theme', 'dark/light')`
3. CSS 变量在 `[data-theme="dark"]` 选择器下重新定义

### 状态持久化

- 使用 `localStorage` 存储用户选择
- 页面加载时立即应用，避免闪烁

---

## 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| `index.html` | 重写 HTML 结构、CSS 变量定义、组件样式、主题切换按钮 |
| `app.js` | 添加主题切换逻辑、更新渲染函数适配新样式 |

---

## 验收标准

- 深色/浅色模式切换正常工作
- 所有组件样式符合 Apple 设计规范
- 响应式布局在移动端正常显示
- 主题偏好持久化，页面刷新后保持用户选择
- 导航栏玻璃态效果正常显示