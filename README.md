# MC挂件

给你的头像戴上 **Minecraft 像素挂件** —— 上传头像，选择挂件素材，调好位置一键下载。

## 素材

| 预览 | 名称 | 说明 |
|---|---|---|
| 🎭 | 乐魂 | 灵魂像素头像 |
| 🤖 | 铜傀儡 | MC 铜傀儡 |
| 🔩 | 铜傀儡生锈 | 锈化铜傀儡 |
| 🐥 | 小鸡 | MC 小鸡 |

小鸡默认放在合成图的**左下角**，其余素材在**右下角**。

## 技术栈

- **React 19** — useTransition / memo
- **TypeScript** — strict 全开
- **Webpack 5** — HtmlWebpackPlugin + CopyWebpackPlugin
- **Canvas 2D** — 纯同步绘制，零异步开销

## 构建与运行

```bash
npm install
npm run dev      # 开发模式 (localhost:5173)
npm run build    # 生产构建 → dist/
npm run preview  # 生产预览 (localhost:8000)
```

## 开发

```
src/
├── App.tsx              # 状态机入口
├── components/          # UI 组件
│   ├── Header.tsx
│   ├── UploadArea.tsx
│   ├── OverlayPicker.tsx
│   ├── CropPanel.tsx
│   ├── Preview.tsx
│   ├── ControlSlider.tsx
│   ├── DownloadButton.tsx
│   └── StatusBar.tsx
├── hooks/               # 自定义 hooks
│   ├── useImageLoader.ts
│   └── useOverlayCache.ts
├── data/overlays.ts     # 素材元数据（增删改一行）
└── styles.css           # Quarter‑Flat 风格
```

添加新素材只需：

1. 图片丢到 `public/assets/`
2. `src/data/overlays.ts` 加一行对象
3. 构建即可

## 许可证

MIT
