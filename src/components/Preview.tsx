import { memo, useCallback, useEffect, useRef, useState } from "react";
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

export const Preview = memo(function Preview({ img, overlay, cropRect, scale, ox, oy, cacheReady }: Props) {
	const ref = useRef<HTMLCanvasElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const avatarBuf = useRef<HTMLCanvasElement | null>(null);
	const compBuf = useRef<HTMLCanvasElement | null>(null);
	const cropKey = useRef("");
	const [outSize, setOutSize] = useState(0);

	const updateSize = useCallback(() => {
		const c = ref.current;
		const w = wrapRef.current?.clientWidth ?? 280;
		const size = Math.min(w - 32, 320);
		if (c) {
			c.style.width = `${size}px`;
			c.style.height = `${size}px`;
		}
	}, []);

	useEffect(() => {
		updateSize();
		const ro = new ResizeObserver(updateSize);
		if (wrapRef.current) ro.observe(wrapRef.current);
		return () => ro.disconnect();
	}, [updateSize]);

	useEffect(() => {
		void cacheReady;
		const c = ref.current;
		if (!c) return;

		const sx = cropRect.x * img.naturalWidth;
		const sy = cropRect.y * img.naturalHeight;
		const sw = cropRect.w * img.naturalWidth;
		const out = Math.round(sw);
		if (out < 1) return;

		setOutSize(out);

		const key = `${sx.toFixed(1)},${sy.toFixed(1)},${out}`;

		if (key !== cropKey.current) {
			cropKey.current = key;
			const b = document.createElement("canvas");
			b.width = out;
			b.height = out;
			const bc = b.getContext("2d");
			if (!bc) return;
			bc.imageSmoothingEnabled = true;
			bc.imageSmoothingQuality = "high";
			bc.drawImage(img, sx, sy, sw, sw, 0, 0, out, out);
			avatarBuf.current = b;
		}

		const base = avatarBuf.current;
		if (!base) return;

		let comp = compBuf.current;
		if (!comp || comp.width !== out || comp.height !== out) {
			comp = document.createElement("canvas");
			comp.width = out;
			comp.height = out;
			compBuf.current = comp;
		}
		const cc = comp.getContext("2d");
		if (!cc) return;
		cc.clearRect(0, 0, out, out);
		cc.imageSmoothingEnabled = true;
		cc.imageSmoothingQuality = "high";
		cc.drawImage(base, 0, 0);

		if (overlay) {
			const ls = out * (scale / 100);
			const chick = overlay.src.includes("chick");
			const lx = chick ? 0 + ox : out - ls + ox;
			const ly = out - ls + oy;
			cc.drawImage(overlay, lx, ly, ls, ls);
		}

		c.width = out;
		c.height = out;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(comp, 0, 0);
	}, [img, overlay, cropRect, scale, ox, oy, cacheReady]);

	return (
		<div className="preview-wrap" ref={wrapRef}>
			<canvas ref={ref} className="preview-canvas" />
			{outSize > 0 && (
				<span className="preview-size">
					{outSize} x {outSize}
				</span>
			)}
		</div>
	);
});
