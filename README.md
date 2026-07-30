# MC 挂件

给你的头像戴上 **Minecraft 像素挂件**。上传头像，裁剪 1:1，选一枚挂件素材，调好位置和大小，一键导出。

> 🧪 测试版：[beta.mc-jian.pages.dev](https://beta.mc-jian.pages.dev)　·　正式版：[mc-jian.pages.dev](https://mc-jian.pages.dev)

---

## 素材

| 预览 | 名称 |
|---|---|
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/le.webp" width="64" alt="乐魂"> | 乐魂 |
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/copper.webp" width="64" alt="铜傀儡"> | 铜傀儡 | 
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/copper-weathered.webp" width="64" alt="铜傀儡·斑驳"> | 铜傀儡·斑驳 |
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/copper-rusted.webp" width="64" alt="铜傀儡·锈蚀"> | 铜傀儡·锈蚀 |
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/copper-oxidized.webp" width="64" alt="铜傀儡·氧化"> | 铜傀儡·氧化 |
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/chick.webp" width="64" alt="小鸡"> | 小鸡 |
| <img src="https://raw.githubusercontent.com/DingdingOvO/mc-jian/main/public/assets/slime.webp" width="64" alt="硫磺史莱姆"> | 硫磺史莱姆 | 

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

1. PNG 原图放入 `public/assets/` 留作备份
2. 转换为 WebP（`public/assets/` 下同时保留 PNG + WebP，运行时不加载 PNG）
3. 在 `src/data/overlays.ts` 的 `OVERLAYS` 数组追加一行：

```ts
{ id: "my-overlay", label: "我的挂件", url: "/assets/my-overlay.webp", baseSize: 512 }
```

3. `npm run build` — 构建完成即可在面板中选择。

---

## 许可证

MIT
