# 登录页面 UI 设计分析

> 来源: CareerCompassAI (https://careercompassai.vercel.app/login)

## 一、整体布局

### 分屏设计
- **左侧区域 (50%)**: 品牌展示区，仅在大屏显示 (lg:grid-cols-2)
- **右侧区域 (50%)**: 登录表单区
- **移动端**: 单列布局，隐藏左侧区域，表单居中

---

## 二、左侧品牌展示区

### 背景设计
- **渐变背景**: `bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600`
- **暗色模式**: `dark:from-white/90 dark:via-white/80 dark:to-white/70`
- **网格装饰**: `bg-grid-white/[0.05] bg-[size:20px_20px]` (微弱的网格图案)
- **模糊光晕**: 两个圆形模糊光晕装饰 (blur-3xl)

### 装饰图形元素
- **模拟图表**: 使用CSS创建的柱状图/图形装饰
- **图形特点**:
  - 4个不同颜色的柱状图形
  - 紫色柱 (rgb(108, 63, 245)) - 最高，带"眼睛"装饰
  - 黑色柱 (rgb(45, 45, 45)) - 中等高度
  - 橙色半圆 (rgb(255, 155, 107)) - 底部装饰，带"眼睛"
  - 黄色半圆 (rgb(232, 215, 84)) - 带笑脸装饰
- **轻微倾斜**: 使用 `transform: skewX()` 创造动感

### 内容结构
- **顶部**: Logo + 品牌名称
- **中部**: 装饰图形 (居中对齐)
- **底部**: Privacy Policy / Terms of Service 链接

---

## 三、右侧登录表单区

### 容器设计
- **背景**: `bg-background` (纯白色)
- **内边距**: `p-8`
- **表单宽度**: `max-w-[420px]`

### 表单结构

#### 标题区
- **主标题**: "Welcome back!"
  - 字体: `text-3xl font-bold tracking-tight`
  - 间距: `mb-2`
- **副标题**: "Please enter your details"
  - 字体: `text-muted-foreground text-sm`
  - 间距: `mb-10`

#### 输入框设计
- **圆角**: `rounded-full` (药丸形状, border-radius: 9999px)
- **高度**: `h-12` (48px)
- **内边距**: `px-4 py-2`
- **边框**: `border-border/60` (半透明边框)
- **背景**: `bg-background`
- **聚焦状态**: `focus:border-primary` + ring 效果
- **字体**: `text-base md:text-sm`

#### 密码框特殊设计
- **眼睛图标**: 右侧显示/隐藏密码切换按钮
- **位置**: `absolute right-3 top-1/2 -translate-y-1/2`

#### 功能链接
- **Remember checkbox**: 左侧 "Remember for 30 days"
- **Forgot password**: 右侧链接 `text-primary hover:underline`

#### 登录按钮
- **形状**: `rounded-full` (药丸形状)
- **高度**: `h-12` (48px)
- **Hover动画**:
  - 文字向右滑出并淡出 (`translate-x-12 opacity-0`)
  - 新背景+图标滑入 (`opacity-100`)
  - 动画时长: `duration-300`
- **内容**: "Log in" + 右箭头图标

#### Google 登录按钮
- **边框**: `border-border/60` (更淡的边框)
- **同样的 hover 动画效果**
- **图标**: Google logo SVG

#### 底部链接
- **文字**: "Don't have an account? Sign Up"
- **样式**: `text-muted-foreground` + 链接高亮

---

## 四、色彩方案

### 主色调
| 元素 | 值 |
|------|-----|
| Primary | HSL(231, 48%, 48%) ≈ #6366F1 (紫蓝色) |
| Background | #FFFFFF |
| Border | rgba(border, 0.6) |
| Muted Text | rgba(0, 0, 0, 0.56) |

### 左侧装饰图形颜色
| 元素 | RGB |
|------|-----|
| 紫色柱 | rgb(108, 63, 245) |
| 黑色柱 | rgb(45, 45, 45) |
| 橙色圆 | rgb(255, 155, 107) |
| 黄色圆 | rgb(232, 215, 84) |

---

## 五、字体设计

- **主字体**: Inter (Google Fonts)
- **备用字体**: sans-serif
- **标题字重**: 700
- **正文字重**: 400, 500, 600

---

## 六、动画与交互

### 按钮 Hover 效果
```css
.group:hover .text {
  transform: translateX(12);
  opacity: 0;
}
.group:hover .bg-primary {
  opacity: 1;
}
```
- 文字滑出消失
- 主色背景+箭头图标滑入显示
- 时长: 300ms

### 输入框聚焦
- 边框颜色变为主色
- 显示 ring 效果 (2px ring + 2px offset)

---

## 七、响应式设计

### 断点
- `lg`: 1024px - 显示分屏布局
- `md`: 768px - 字体大小调整
- 小屏: 单列，隐藏左侧，表单居中

---

## 八、设计要点总结

1. **分屏布局** - 品牌展示与功能性分离
2. **药丸形状** - 输入框和按钮使用 rounded-full
3. **装饰图形** - CSS绘制的图表元素增加趣味性
4. **微妙渐变** - 灰色渐变背景配合光晕装饰
5. **流畅动画** - 按钮hover的文字滑动效果
6. **功能完整** - 记住密码、忘记密码、第三方登录

---

# TodoMaster 设计系统文档

> 基于 CareerCompassAI 风格重构

## 设计系统变量

### Light Mode
```css
--bg-primary: #FFFFFF;
--bg-surface: #FFFFFF;
--bg-surface-2: #F9FAFB;
--accent: #6366F1;
--accent-hover: #4F46E5;
--text-primary: #1F2937;
--text-muted: rgba(0,0,0,0.5);
--border: rgba(229,231,235,0.8);
--radius-sm: 9999px;    /* 输入框/按钮 */
--radius-md: 24px;      /* 卡片 */
```

### Dark Mode
```css
--bg-primary: #111827;
--bg-surface: #1F2937;
--accent: #818CF8;
--accent-hover: #A78BFA;
--text-primary: #F9FAFB;
--border: rgba(75,85,99,0.8);
```

## 组件规范

### 按钮
- 圆角: 9999px (rounded-full)
- 高度: 40-48px
- Hover: 文字滑动消失 + 紫色背景填充

### 输入框
- 圆角: 9999px (rounded-full)
- 高度: 48px
- Focus: 紫色边框 + ring效果

### 卡片
- 圆角: 24px (rounded-3xl)
- 边框: 1px solid var(--border)
- Hover: 紫色阴影

### 优先级标签
- 高: 红色 (rgba(239,68,68,0.12))
- 中: 橙色 (rgba(255,149,0,0.12))
- 低: 紫色 (rgba(99,102,241,0.12))

---

## 动态效果

### 登录页面动画

#### 1. 柱状图浮动动画
```css
@keyframes float {
    0%, 100% { transform: skewX(2deg) translateY(0); }
    50% { transform: skewX(2deg) translateY(-8px); }
}
```
- 4个柱状图有不同延迟 (0s, 0.5s, 1s, 1.5s)
- 动画时长: 4s
- 效果: 轻微上下浮动

#### 2. 光晕脉冲动画
```css
@keyframes pulse-glow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(1.1); }
}
```
- 两个光晕有不同时长 (4s, 5s) 和延迟
- 效果: 呼吸式脉冲

#### 3. 眼睛跟随鼠标
```javascript
// 眼睛跟踪鼠标位置
document.addEventListener('mousemove', (e) => {
    const normalizedX = Math.max(-1, Math.min(1, (e.clientX - centerX) / 300));
    const normalizedY = Math.max(-1, Math.min(1, (e.clientY - centerY) / 300));
    
    eyeDots.forEach(eye => {
        eye.style.transform = `translate(${normalizedX * 3}px, ${normalizedY * 3}px)`;
    });
});
```
- 4只眼睛跟随鼠标移动
- 最大移动距离: 3px
- 过渡动画: 0.1s ease-out

#### 4. 按钮Hover动画
```css
.btn:hover .btn-text {
    transform: translateX(40px);
    opacity: 0;
}
.btn:hover .btn-hover-bg {
    opacity: 1;
}
```
- 文字向右滑出并淡出
- 紫色背景+箭头图标滑入
- 动画时长: 0.3s

### Reduced Motion 支持
```css
@media (prefers-reduced-motion: reduce) {
    * {
        transition: none !important;
        animation: none !important;
    }
}
```