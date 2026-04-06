# Apple Store Online UI Design System

> 基于 Apple 香港官网商店页面 (https://www.apple.com/hk/store) 的 UI 设计规范提取
> 提取日期: 2026-04-06

---

## 1. 设计哲学

Apple 的设计遵循以下核心原则：

- **极简主义** - 减少视觉噪音，只保留必要元素
- **留白优先** - 大量留白让内容呼吸，提升阅读体验
- **产品聚焦** - 产品图片是主角，UI 元素退居幕后
- **一致性** - 全站统一的视觉语言和交互模式
- **优雅过渡** - 所有状态变化都有平滑的动画过渡

---

## 2. 色彩系统

### 2.1 主色调

| 用途 | 色值 | 使用场景 |
|------|------|----------|
| 主背景色 | `rgb(245, 245, 247)` / `#F5F5F7` | 页面背景、卡片容器 |
| 主文字色 | `rgb(29, 29, 31)` / `#1D1D1F` | 正文、标题、产品名称 |
| 次文字色 | `rgb(110, 110, 115)` / `#6E6E73` | 辅助说明、副标题 |
| 导航文字色 | `rgba(0, 0, 0, 0.8)` | 导航链接 |
| 卡片背景 | `rgb(255, 255, 255)` / `#FFFFFF` | 产品卡片、悬停状态 |
| 强调链接色 | `rgb(29, 29, 31)` / `#1D1D1F` | CTA 链接（无蓝色） |

### 2.2 透明度层级

```css
/* 文字透明度层级 */
rgba(0, 0, 0, 1.0)   /* 主要内容 */
rgba(0, 0, 0, 0.8)   /* 导航链接 */
rgba(0, 0, 0, 0.56)  /* 次级内容 */
rgba(0, 0, 0, 0.3)   /* 禁用状态 */
```

### 2.3 背景策略

- **页面底色**: 浅灰 `#F5F5F7`，营造柔和舒适感
- **卡片底色**: 纯白 `#FFFFFF`，与背景形成微妙对比
- **无渐变**: 不使用复杂渐变，保持纯净感
- **无边框**: 卡片间无可见边框，通过背景色差异分隔

---

## 3. 字体系统

### 3.1 字体栈

```css
font-family: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**注**: SF Pro 是 Apple 自研字体，Web 端需通过 CDN 或 Webfont 加载。

### 3.2 字号规范

| 元素 | 字号 | 字重 | 行高 |
|------|------|------|------|
| Hero H1 | `80px` | `600` | `84px` |
| 大标题 | `48px` | `600` | `52px` |
| 中标题 | `24px` | `600` | `28px` |
| 区块标题 | `24px` | `600` | `28px` |
| 正文 | `17px` | `400` | `25px` |
| 导航链接 | `12px` | `400` | `16px` |
| 副标题/标签 | `14px` | `400` | `18px` |
| 小字/说明 | `12px` | `400` | `16px` |

### 3.3 字重使用

```css
font-weight: 600;  /* 标题、强调 */
font-weight: 400;  /* 正文、链接 */
```

---

## 4. 布局系统

### 4.1 容器规范

```css
/* 主容器 */
max-width: 1440px;
padding: 0;

/* 内容区 */
padding-left: auto;
padding-right: auto;
```

### 4.2 导航栏高度

```css
height: 44px;
position: fixed;
top: 0;
z-index: 9999;
backdrop-filter: saturate(180%) blur(20px);
background-color: rgba(255, 255, 255, 0.72);
```

### 4.3 横向滚动区域

```css
/* 卡片滚动容器 */
overflow-x: scroll;
scroll-behavior: smooth;
padding: 0 0 38px;

/* 防止滚动条显示 */
-webkit-overflow-scrolling: touch;
scrollbar-width: none;  /* Firefox */
```

### 4.4 响应式断点

| 断点 | 适用设备 |
|------|----------|
| `≥1440px` | 大屏桌面 |
| `1068px - 1439px` | 中屏桌面 |
| `734px - 1067px` | 小屏桌面/平板 |
| `<734px` | 手机 |

---

## 5. 组件规范

### 5.1 产品导航卡片 (小卡片)

```css
/* 产品分类导航卡片 */
.rs-productnav-card {
  width: 136px;
  height: 148px;
  border-radius: 18px;
  background-color: transparent;
  transition: all 0.3s ease;
}

/* 产品图片 */
.rs-productnav-card img {
  width: 120px;
  height: 78px;
  object-fit: contain;
}

/* 产品名称 */
.rs-productnav-card-label {
  font-size: 14px;
  font-weight: 400;
  color: #1D1D1F;
  text-align: center;
  margin-top: 12px;
}
```

**视觉特征**:
- 产品图片居上，名称居下
- 圆角 `18px`，现代感强
- 无边框，纯白背景
- 悬停时轻微放大

### 5.2 大型产品卡片

```css
/* 横向滚动大卡片 */
.rf-cards-cardtile {
  width: 313px;
  height: 500px;
  border-radius: 18px;
  background-color: #FFFFFF;
  box-shadow: none;
}

/* 卡片内产品图片 */
.rf-cards-cardtile img {
  width: 100%;
  height: 60%;
  object-fit: contain;
  padding: 24px;
}
```

**视觉特征**:
- 大尺寸展示，突出产品视觉
- 产品图片占据卡片大部分空间
- 标题和价格紧凑排列在底部
- `18px` 大圆角，视觉柔和

### 5.3 悬停效果

```css
/* 卡片悬停 */
.rf-cards-cardtile:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 链接悬停 */
a:hover {
  color: rgba(0, 0, 0, 1);
  transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
}
```

---

## 6. 导航设计

### 6.1 顶部导航栏

```css
.ac-gn {
  height: 44px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* 导航链接 */
.ac-gn-link {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.8);
  padding: 0 10px;
  transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
}

/* Logo */
.ac-gn-logo {
  font-size: 17px;  /* Apple logo icon */
}
```

**视觉特征**:
- 毛玻璃效果 (backdrop-filter)
- 固定定位，始终可见
- 导航链接字号较小 (`12px`)
- Logo 略大 (`17px`)

### 6.2 面包屑/副导航

```css
/* Store 页面副导航 */
font-size: 12px;
color: rgba(0, 0, 0, 0.8);
padding: 12px 0;
```

---

## 7. 内容区块

### 7.1 Hero 区域

```css
/* 主标题区 */
.hero h1 {
  font-size: 80px;
  font-weight: 600;
  color: #1D1D1F;
  line-height: 84px;
  text-align: center;
}

/* 副标题 */
.hero h2 {
  font-size: 12px;
  font-weight: 400;
  color: #6E6E73;
  text-align: center;
}
```

### 7.2 分区标题

```css
/* 各区块标题 */
.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1D1D1F;
  margin-bottom: 24px;
}
```

### 7.3 价格展示

```css
/* 价格文字 */
.price {
  font-size: 14px;
  font-weight: 400;
  color: #1D1D1F;  /* 白底卡片用 #1D1D1F */
  /* 深色背景用 */
  color: #FFFFFF;
}

/* 价格前缀 */
.price-prefix {
  content: "From ";
}
```

---

## 8. 动效规范

### 8.1 过渡曲线

Apple 使用自定义贝塞尔曲线：

```css
/* 标准过渡 */
transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
transition: transform 0.3s ease;
transition: opacity 0.3s ease;

/* 快速过渡 */
transition: all 0.2s ease;
```

### 8.2 卡片动画

```css
/* 进入动画 */
.rf-cards-card {
  opacity: 0;
  transform: translateY(20px);
  animation: cardFadeIn 0.6s ease forwards;
}

@keyframes cardFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 8.3 悬停反馈

```css
/* 所有可交互元素 */
a, button, [role="button"] {
  cursor: pointer;
  transition: all 0.32s cubic-bezier(0.4, 0, 0.6, 1);
}

/* 悬停状态 */
:hover {
  transform: scale(1.02);
  opacity: 0.9;
}
```

---

## 9. 间距系统

### 9.1 内间距

| 元素 | Padding |
|------|---------|
| 导航栏 | `0` |
| 内容容器 | `0 48px` (左右边距) |
| 卡片 | `16px 0 40px` |
| 产品卡片内容 | `24px` |
| Footer | `40px 0` |

### 9.2 外间距

| 元素 | Margin |
|------|--------|
| 区块间距 | `62px` (大区块) |
| 卡片间距 | `12px` |
| 标题与内容 | `24px` |
| 产品导航区 | `38px` |

### 9.3 基准单位

- 基础间距单位: `4px`
- 常用间距倍数: `8px`, `12px`, `16px`, `24px`, `38px`, `40px`, `62px`

---

## 10. 阴影与边框

### 10.1 阴影策略

Apple 风格 **极少使用阴影**：

```css
/* 默认状态 - 无阴影 */
box-shadow: none;

/* 悬停状态 - 微妙阴影 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* 深层阴影 (极少使用) */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### 10.2 边框策略

```css
/* 无边框设计 */
border: none;

/* 导航底边分隔线 */
border-bottom: 1px solid rgba(0, 0, 0, 0.1);
```

---

## 11. 圆角系统

| 元素 | 圆角值 |
|------|--------|
| 大卡片 | `18px` |
| 小卡片/按钮 | `12px` |
| 输入框 | `8px` |
| 标签/徽章 | `4px` |
| 全宽区块 | `0px` |

---

## 12. 图像规范

### 12.1 产品图片

```css
/* 产品图容器 */
.product-image {
  object-fit: contain;  /* 保持比例，不裁剪 */
  max-width: 100%;
  max-height: 100%;
}

/* 图片加载 */
.product-image {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.product-image.loaded {
  opacity: 1;
}
```

### 12.2 图片尺寸

| 卡片类型 | 图片尺寸 |
|----------|----------|
| 小导航卡片 | `120px × 78px` |
| 大产品卡片 | `313px × 300px` (占卡片 60%) |
| Hero 图片 | 全宽 |

---

## 13. 链接与 CTA

### 13.1 链接样式

```css
/* 标准链接 */
a {
  color: #1D1D1F;
  text-decoration: none;
  transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
}

a:hover {
  text-decoration: underline;
}
```

**特点**: Apple 不使用传统蓝色链接，保持与正文一致的颜色。

### 13.2 CTA 按钮

```css
/* 主要 CTA */
.cta-primary {
  background: #0071E3;  /* Apple 蓝色 */
  color: #FFFFFF;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 400;
}

/* 次级 CTA */
.cta-secondary {
  background: transparent;
  color: #1D1D1F;
  border-radius: 12px;
  padding: 8px 16px;
}
```

---

## 14. Footer 设计

```css
.ac-footer {
  background-color: #F5F5F7;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.56);
  padding: 40px 48px;
}

/* Footer 链接 */
.ac-footer a {
  color: rgba(0, 0, 0, 0.56);
}
```

---

## 15. CSS 代码模板

### 15.1 基础样式

```css
/* ==================== Apple Style Variables ==================== */
:root {
  /* Colors */
  --apple-bg: #F5F5F7;
  --apple-white: #FFFFFF;
  --apple-text-primary: #1D1D1F;
  --apple-text-secondary: #6E6E73;
  --apple-text-nav: rgba(0, 0, 0, 0.8);
  --apple-text-muted: rgba(0, 0, 0, 0.56);

  /* Typography */
  --apple-font: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --apple-font-hero: 80px;
  --apple-font-title: 48px;
  --apple-font-section: 24px;
  --apple-font-body: 17px;
  --apple-font-nav: 12px;
  --apple-font-small: 14px;

  /* Radius */
  --apple-radius-card: 18px;
  --apple-radius-button: 12px;
  --apple-radius-input: 8px;

  /* Spacing */
  --apple-space-section: 62px;
  --apple-space-card: 12px;
  --apple-space-content: 24px;

  /* Animation */
  --apple-transition: cubic-bezier(0.4, 0, 0.6, 1);
  --apple-duration: 0.32s;
}

/* ==================== Base Styles ==================== */
body {
  font-family: var(--apple-font);
  font-size: var(--apple-font-body);
  line-height: 1.47;
  color: var(--apple-text-primary);
  background-color: var(--apple-bg);
  -webkit-font-smoothing: antialiased;
}

/* ==================== Navigation ==================== */
.apple-nav {
  height: 44px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.apple-nav-link {
  font-size: var(--apple-font-nav);
  color: var(--apple-text-nav);
  padding: 0 10px;
  transition: color var(--apple-duration) var(--apple-transition);
}

.apple-nav-link:hover {
  color: var(--apple-text-primary);
}

/* ==================== Hero Section ==================== */
.apple-hero {
  text-align: center;
  padding: 100px 0 60px;
}

.apple-hero h1 {
  font-size: var(--apple-font-hero);
  font-weight: 600;
  color: var(--apple-text-primary);
  line-height: 1.05;
}

.apple-hero h2 {
  font-size: var(--apple-font-small);
  font-weight: 400;
  color: var(--apple-text-secondary);
  margin-top: 8px;
}

/* ==================== Cards ==================== */
.apple-card-small {
  width: 136px;
  height: 148px;
  border-radius: var(--apple-radius-card);
  background: var(--apple-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  transition: transform 0.3s ease;
}

.apple-card-small:hover {
  transform: scale(1.02);
}

.apple-card-large {
  width: 313px;
  height: 500px;
  border-radius: var(--apple-radius-card);
  background: var(--apple-white);
  overflow: hidden;
}

.apple-card-large img {
  width: 100%;
  height: 60%;
  object-fit: contain;
  padding: 24px;
}

.apple-card-content {
  padding: 24px;
  text-align: center;
}

.apple-card-title {
  font-size: var(--apple-font-section);
  font-weight: 600;
  color: var(--apple-text-primary);
}

.apple-card-price {
  font-size: var(--apple-font-small);
  color: var(--apple-text-secondary);
  margin-top: 8px;
}

/* ==================== Horizontal Scroll ==================== */
.apple-scroll-container {
  display: flex;
  gap: var(--apple-space-card);
  overflow-x: scroll;
  padding: 0 0 38px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.apple-scroll-container::-webkit-scrollbar {
  display: none;
}

/* ==================== Links ==================== */
.apple-link {
  color: var(--apple-text-primary);
  text-decoration: none;
  transition: color var(--apple-duration) var(--apple-transition);
}

.apple-link:hover {
  text-decoration: underline;
}

/* ==================== CTA Buttons ==================== */
.apple-btn-primary {
  background: #0071E3;
  color: #FFFFFF;
  border-radius: var(--apple-radius-button);
  padding: 8px 16px;
  font-size: var(--apple-font-small);
  font-weight: 400;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.apple-btn-primary:hover {
  background: #0077ED;
}

.apple-btn-secondary {
  background: transparent;
  color: var(--apple-text-primary);
  border-radius: var(--apple-radius-button);
  padding: 8px 16px;
  font-size: var(--apple-font-small);
  font-weight: 400;
  border: 1px solid var(--apple-text-primary);
  cursor: pointer;
}

/* ==================== Footer ==================== */
.apple-footer {
  background: var(--apple-bg);
  font-size: var(--apple-font-nav);
  color: var(--apple-text-muted);
  padding: 40px 48px;
}
```

---

## 16. 设计要点总结

### 核心特征

| 特征 | Apple 实现 |
|------|-----------|
| **配色** | 浅灰背景 + 纯白卡片，无强烈对比 |
| **圆角** | 大圆角 `18px`，现代柔和感 |
| **阴影** | 极少使用，悬停时微妙阴影 |
| **字体** | SF Pro 系列，字号阶梯清晰 |
| **留白** | 大量留白，区块间距 `62px` |
| **动画** | 自定义贝塞尔曲线，平滑自然 |
| **链接** | 无蓝色链接，与正文同色 |
| **产品图** | `contain` 模式，不裁剪产品 |

### 布局原则

1. **产品优先** - 产品图片占据视觉重心
2. **横向滚动** - 用横向滚动展示多个产品
3. **无干扰** - UI 元素退居幕后，不打扰浏览
4. **呼吸感** - 大量留白让内容透气
5. **一致性** - 全站统一的圆角、间距、字号

---

## 17. 使用建议

### 适用场景

- 电商产品展示页
- 科技品牌官网
- 极简风格设计项目
- 需要突出产品视觉的页面

### 不适用场景

- 内容密集的信息页
- 需要强色彩对比的设计
- 传统企业网站

---

> 此设计系统文档基于 2026-04-06 提取的 Apple 香港官网商店页面设计元素。
> 可作为同类型现代电商/品牌官网 UI 设计的参考模板。