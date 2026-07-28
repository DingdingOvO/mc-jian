import { memo, useEffect, useRef } from "react";
import type { CropRect } from "../types";

interface Props {
	img: HTMLImageElement;
	overlay: HTMLImageElement | null;
	cropRect: CropRect;
	scale: number;
	ox: number;
	oy: number;
	cacheReady: boolean;
}

const PREVIEW = 280;

export const Preview = memo(function Preview({ img, overlay, cropRect, scale, ox, oy, cacheReady }: Props) {
	const ref = useRef<HTMLCanvasElement>(null);
	const avatarBuf = useRef<HTMLCanvasElement | null>(null);
	const cropKey = useRef("");

	useEffect(() => {
		void cacheReady; // trigger re-render when overlay loads
		const c = ref.current;
		if (!c) return;

		const sx = cropRect.x * img.naturalWidth;
		const sy = cropRect.y * img.naturalHeight;
		const sw = cropRect.w * img.naturalWidth;
		const out = Math.round(sw);
		if (out < 1) return;

		const key = `${sx.toFixed(1)},${sy.toFixed(1)},${out}`;

		// 裁剪变化 → 重建头像缓存
		if (key !== cropKey.current) {
			cropKey.current = key;
			const b = document.createElement("canvas");
			b.width = out;
			b.height = out;
			const bc = b.getContext("2d");
			if (!bc) return;
			bc.imageSmoothingEnabled = true;
			bc.imageSmoothingQuality = "high";
			// 1:1 裁剪，sw 同时作为宽高
			bc.drawImage(img, sx, sy, sw, sw, 0, 0, out, out);
			avatarBuf.current = b;
		}

		const base = avatarBuf.current;
		if (!base) return;

		// 合成 buffer = 头像缓存 + 挂件
		const b = document.createElement("canvas");
		b.width = out;
		b.height = out;
		const bc = b.getContext("2d");
		if (!bc) return;
		bc.imageSmoothingEnabled = true;
		bc.imageSmoothingQuality = "high";
		bc.drawImage(base, 0, 0);

		if (overlay) {
			const ls = out * (scale / 100);
			const chick = overlay.src.includes("chick");
			const lx = chick ? 0 + ox : out - ls + ox;
			const ly = out - ls + oy;
			bc.drawImage(overlay, lx, ly, ls, ls);
		}

		// 输出到预览
		c.width = out;
		c.height = out;
		c.style.width = `${PREVIEW}px`;
		c.style.height = `${PREVIEW}px`;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(b, 0, 0);
	}, [img, overlay, cropRect, scale, ox, oy, cacheReady]);

	return (
		<div className="preview-wrap">
			<canvas ref={ref} className="preview-canvas" />
		</div>
	);
});
