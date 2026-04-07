# CareerCompassAI 登录页面动态效果详细分析

## 一、装饰图形结构

### 1.1 四个柱状图

| 柱状图 | 颜色 | 尺寸 | 形状 | 装饰 |
|--------|------|------|------|------|
| 紫色柱 | rgb(108, 63, 245) | 180px × 400px | 矩形圆角顶部 | **眼睛** (18px白圆+7px瞳孔) |
| 黑色柱 | rgb(45, 45, 45) | 120px × 310px | 矩形圆角顶部 | **眼睛** (16px白圆+6px瞳孔) |
| 橙色柱 | rgb(255, 155, 107) | 240px × 200px | 半圆形 | **眼睛** (12px瞳孔，无眼白) |
| 黄色柱 | rgb(232, 215, 84) | 140px × 230px | 半圆形 | **眼睛** (12px瞳孔) + 笑容线 |

### 1.2 眼睛结构对比

| 柱状图 | 眼白容器 | 瞳孔 | 是否有眼白 |
|--------|----------|------|-----------|
| 紫色柱 | 18px × 18px 白色圆形 | 7px × 7px 黑色 | 是 |
| 黑色柱 | 16px × 16px 白色圆形 | 6px × 6px 黑色 | 是 |
| 橙色柱 | 无 | 12px × 12px 黑色 | 否 |
| 黄色柱 | 无 | 12px × 12px 黑色 | 否 |

---

## 二、动态效果详解

### 2.1 柱状图倾斜 (Bar Skew)

**效果**: 所有柱状图跟随鼠标方向倾斜

**实现原理**:
```
鼠标在右侧 → skewX 为负值 (向右倾斜)
鼠标在左侧 → skewX 为正值 (向左倾斜)
```

**数据对比**:

| 鼠标位置 | 紫色柱 skewX | 黑色柱 skewX | 橙色柱 skewX | 黄色柱 skewX |
|----------|-------------|-------------|-------------|-------------|
| 右上角 | -6deg | -6deg | -6deg | -6deg |
| 中心 | -2.87deg | -1.75deg | -3.24deg | -1.11deg |
| 左上角 | +1.17deg | +2.32deg | +0.86deg | +1.5deg |

**CSS过渡**: `transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1)`

**计算公式**:
```javascript
// 假设装饰区域中心为 (centerX, centerY)
// 鼠标位置为 (mouseX, mouseY)
const deltaX = mouseX - centerX;
const skew = (deltaX / 容器宽度) * 最大倾斜角度;
// 例如: skew = (deltaX / 550) * 8;
```

---

### 2.2 眼睛容器位置 (Eye Container Position)

**效果**: 眼睛容器随鼠标移动而位移

**变化维度**:
1. **水平位移 (left)**: 鼠标在左时眼睛向左移动
2. **垂直位移 (top)**: 鼠标在上时眼睛向上移动

**数据对比 - 紫色柱眼睛**:

| 鼠标位置 | left | top | 基准值 | 偏移 |
|----------|------|-----|--------|------|
| 右上角 | 60px | 32.89px | 60px, 40px | +0, -7.11 |
| 中心 | 60px | 42.89px | 60px, 40px | +0, +2.89 |
| 左上角 | 37.96px | 32.89px | 60px, 40px | -22, -7.11 |

**数据对比 - 黑色柱眼睛**:

| 鼠标位置 | left | top | 基准值 | 偏移 |
|----------|------|-----|--------|------|
| 右上角 | 41px | 22.89px | 30px, 30px | +11, -7.11 |
| 中心 | 36.51px | 32.89px | 30px, 30px | +6.5, +2.89 |
| 左上角 | 12.06px | 22.89px | 30px, 30px | -17.9, -7.11 |

**CSS过渡**: `transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1)`

**计算公式**:
```javascript
const deltaX = mouseX - centerX;
const deltaY = mouseY - centerY;

// 眼睛容器的偏移量
const eyeOffsetX = (deltaX / 容器宽度) * 最大水平偏移;  // 约25px
const eyeOffsetY = (deltaY / 容器高度) * 最大垂直偏移;  // 约10px

// 每个眼睛有不同的灵敏度系数
```

---

### 2.3 瞳孔位移 (Pupil Translate)

**效果**: 瞳孔在眼白容器内跟随鼠标

**约束**: 瞳孔不能移出眼白边界

**数据对比 - 紫色柱瞳孔 (眼白18px, 瞳孔7px)**:

| 鼠标位置 | 左瞳孔 | 右瞳孔 |
|----------|--------|--------|
| 右上角 | translate(4.96px, -0.60px) | translate(4.96px, -0.64px) |
| 左上角 | translate(-3.07px, -3.95px) | translate(-3.82px, -3.22px) |

**数据对比 - 黑色柱瞳孔 (眼白16px, 瞳孔6px)**:

| 鼠标位置 | 左瞳孔 | 右瞳孔 |
|----------|--------|--------|
| 右上角 | translate(3.88px, -0.98px) | translate(3.87px, -1.03px) |
| 左上角 | translate(-3.03px, -2.61px) | translate(-3.22px, -2.37px) |

**数据对比 - 橙色柱瞳孔 (直接12px)**:

| 鼠标位置 | 左瞳孔 | 右瞳孔 |
|----------|--------|--------|
| 右上角 | translate(4.70px, -1.72px) | translate(4.67px, -1.79px) |
| 左上角 | translate(-0.89px, -4.92px) | translate(-1.44px, -4.79px) |

**CSS过渡**: `transition: transform 0.1s ease-out`

**最大位移计算**:
```javascript
// 眼白半径 - 瞳孔半径 = 最大位移
// 紫色柱: (18/2) - (7/2) = 9 - 3.5 = 5.5px
// 黑色柱: (16/2) - (6/2) = 8 - 3 = 5px
// 橙色柱/黄色柱: 直接移动，约5px
```

---

### 2.4 笑容线位移

**黄色柱特有**: 一个 80px × 4px 的黑色圆角线条

**效果**: 随鼠标水平位移

**数据对比**:

| 鼠标位置 | left |
|----------|------|
| 右上角 | 55px |
| 中心 | 46.64px |
| 左上角 | ~30px |

---

### 2.5 眼睛闭合动画 (Eye Closing Animation) ⭐ 新增

**效果**: 眼睛从圆形变为水平线（"捂眼睛"效果）

**触发条件**:
1. **快速鼠标移动**: 当鼠标移动速度超过阈值 (velocity > 0.8) 时
2. **密码输入框聚焦**: 当用户聚焦密码输入框时

**动画变化**:

| 状态 | 眼白高度 | 瞳孔可见性 |
|------|----------|-----------|
| 睁眼 (正常) | 18px (紫色柱) / 16px (黑色柱) | 可见 (opacity: 1) |
| 闭眼 (捂眼) | 2px | 隐藏 (opacity: 0) |

**CSS过渡**: `transition: all 0.15s ease-out`

**实现原理**:
```javascript
// 计算鼠标速度
const currentTime = Date.now();
const timeDelta = currentTime - lastMouseTime;
const distance = Math.sqrt(
    Math.pow(mouseX - lastMouseX, 2) +
    Math.pow(mouseY - lastMouseY, 2)
);
const mouseVelocity = distance / timeDelta;

// 判断是否闭眼
const shouldCloseEyes = mouseVelocity > 0.8 || (isOverPasswordArea && isPasswordFocused);

// 更新眼白高度
eyeWhite.style.height = shouldCloseEyes ? '2px' : '18px';
pupil.style.opacity = shouldCloseEyes ? '0' : '1';
```

**设计理念**:
- 当用户快速移动鼠标时，角色"眨眼"保护眼睛
- 当用户聚焦密码输入框时，角色"捂眼睛"不看密码
- 营造俏皮、人性化的交互体验

---

## 三、过渡时间总结

| 元素 | 过渡时间 | 缓动函数 |
|------|----------|----------|
| 柱状图倾斜 | 0.7s | cubic-bezier(0.4, 0, 0.2, 1) |
| 眼睛容器位置 | 0.7s | cubic-bezier(0.4, 0, 0.2, 1) |
| 瞳孔位移 | 0.1s | ease-out |
| 眼睛闭合 | 0.15s | ease-out |

**关键设计理念**:
- 柱状图和眼睛容器使用较长的过渡时间 (0.7s)，产生优雅的延迟效果
- 瞳孔使用极短的过渡时间 (0.1s)，产生即时响应感
- 眼睛闭合使用中等过渡时间 (0.15s)，产生自然的眨眼效果

---

## 四、实现伪代码

```javascript
// 装饰区域尺寸
const CONTAINER_WIDTH = 550;
const CONTAINER_HEIGHT = 400;

// 柱状图配置
const bars = [
    {
        id: 'purple',
        element: bar1Element,
        eyeContainer: eyeContainer1,
        pupils: [pupil1, pupil2],
        eyeWhiteSize: 18,
        pupilSize: 7,
        eyeBaseLeft: 60,
        eyeBaseTop: 40,
        maxSkew: 6,
        skewMultiplier: 1.0
    },
    {
        id: 'black',
        element: bar2Element,
        eyeContainer: eyeContainer2,
        pupils: [pupil3, pupil4],
        eyeWhiteSize: 16,
        pupilSize: 6,
        eyeBaseLeft: 30,
        eyeBaseTop: 30,
        maxSkew: 6,
        skewMultiplier: 1.2
    },
    // ... 橙色柱、黄色柱
];

// 鼠标移动处理
document.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // 归一化
    const normalizedX = deltaX / CONTAINER_WIDTH;  // -0.5 到 0.5
    const normalizedY = deltaY / CONTAINER_HEIGHT;
    
    bars.forEach(bar => {
        // 1. 计算柱状图倾斜
        const skew = normalizedX * bar.maxSkew * bar.skewMultiplier * 2;
        bar.element.style.transform = `skewX(${skew}deg)`;
        
        // 2. 计算眼睛容器位置
        const eyeLeft = bar.eyeBaseLeft + normalizedX * 50;
        const eyeTop = bar.eyeBaseTop + normalizedY * 15;
        bar.eyeContainer.style.left = `${eyeLeft}px`;
        bar.eyeContainer.style.top = `${eyeTop}px`;
        
        // 3. 计算瞳孔位移
        const maxPupilMove = (bar.eyeWhiteSize - bar.pupilSize) / 2 - 0.5;
        const pupilX = normalizedX * maxPupilMove * 2;
        const pupilY = normalizedY * maxPupilMove * 2;
        
        bar.pupils.forEach((pupil, i) => {
            // 添加微小随机差异，使两只眼睛不完全同步
            const offsetX = (Math.random() - 0.5) * 0.5;
            const offsetY = (Math.random() - 0.5) * 0.5;
            pupil.style.transform = `translate(${pupilX + offsetX}px, ${pupilY + offsetY}px)`;
        });
    });
});
```

---

## 五、关键设计细节

1. **两只眼睛不完全同步**: 每个瞳孔有微小的随机偏移 (±0.5px)，使眼睛看起来更自然

2. **不同柱状图有不同的灵敏度**: 黑色柱的倾斜灵敏度更高 (1.2倍)

3. **瞳孔约束在眼白内**: 通过计算 `(eyeWhiteSize - pupilSize) / 2` 确保瞳孔不会移出边界

4. **分层过渡时间**: 大动作 (柱状图倾斜、眼睛位移) 用慢过渡，小动作 (瞳孔移动) 用快过渡

5. **所有柱状图同步倾斜**: 它们共享相同的鼠标位置计算，但有不同的灵敏度系数