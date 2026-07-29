# MC 挂件

给你的头像戴上 **Minecraft 像素挂件**。上传头像，裁剪 1:1，选一枚挂件素材，调好位置和大小，一键导出。

> 🧪 测试版：[beta.mc-jian.pages.dev](https://beta.mc-jian.pages.dev)　·　正式版：[mc-jian.pages.dev](https://mc-jian.pages.dev)

---

## 素材

| ID | 名称 | 说明 |
|---|---|---|
| `le` | 🎭 乐魂 | 半透明灵魂像素风格 |
| `copper` | 🤖 铜傀儡 | 经典铜傀儡 |
| `copper_w` | 🔩 铜傀儡·斑驳 | 轻度风化 |
| `copper_r` | 🔧 铜傀儡·锈蚀 | 中度锈蚀 |
| `copper_o` | 🟤 铜傀儡·氧化 | 重度氧化 |
| `chick` | 🐥 小鸡 | 乖巧蹲角落 |
| `slime` | 🟢 硫磺史莱姆 | 萤光绿凝胶 |

> 小鸡默认放在**左下角**，其余素材放在**右下角**。位置和大小可在预览区自由调整。

---

## 功能

- **1:1 智能裁剪** — 拖拽平移 + 双指/滚轮缩放，支持任意尺寸头像
- **实时预览** — Canvas 合成渲染，所见即所得
- **三档调节** — 挂件占比、水平偏移、垂直偏移，滑块精确控制
- **深色 / 浅色 / 跟随系统** — 主题持久化，页面打开零闪白
- **多格式导出** — PNG（无损透明）、JPEG（自动白底）、WebP（最小体积）

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 19 |
| 语言 | TypeScript（strict） |
| 构建 | Vite 8 |
| 渲染 | Canvas 2D — 纯同步绘制 |
| 代码质量 | Biome 2.5（lint + format） |
| 部署 | Cloudflare Pages |

---

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 开发模式 → localhost:5173
npm run build        # 生产构建 → dist/
npm run preview      # 生产预览 → localhost:8000
npm run deploy       # 部署到 Cloudflare Workers
```

---

## 项目结构

```
src/
├── App.tsx                 # 根组件 — 状态机 + 下载管线
├── App.css                 # 全局样式 + 主题变量
├── index.tsx               # React 入口
├── types.ts                # 公共类型
├── components/
│   ├── Header.tsx           # 品牌标识
│   ├── Icons.tsx            # SVG 图标库（Lucide 风格 + FA6 路径）
│   ├── UploadArea.tsx       # 拖拽 / 点击上传
│   ├── CropPanel.tsx        # 1:1 裁剪 — Pointer Events + 双指缩放
│   ├── Preview.tsx          # Canvas 合成预览
│   └── OverlayPicker.tsx    # 挂件选择面板
├── hooks/
│   ├── useImageLoader.ts    # File → Image 加载
│   └── useOverlayCache.ts   # 素材预加载缓存
└── data/
    └── overlays.ts          # 素材元数据（增删一行即可）
```

### 添加新素材

1. 图片放入 `public/assets/`
2. 在 `src/data/overlays.ts` 的 `OVERLAYS` 数组追加一行：

```ts
{ id: "my-overlay", label: "我的挂件", url: "/assets/my-overlay.webp", baseSize: 512 }
```

3. `npm run build` — 构建完成即可在面板中选择。

---

## 许可证

MIT
