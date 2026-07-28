import { memo, useEffect, useRef } from "react";

interface Props {
	avatarDataUrl: string | null;
	avatarImgRef: { current: HTMLImageElement | null };
	overlayId: string;
	overlayCacheRef: { current: Map<string, HTMLImageElement> };
	scale: number;
	offsetX: number;
	offsetY: number;
	finalCanvasRef: { current: HTMLCanvasElement | null };
}

const PREVIEW_MAX = 280;

/** @performance 复用 buffer canvas 避免内存抖动，挂 ref 而非模块级变量 */
export const Preview = memo(function Preview({
	avatarDataUrl,
	avatarImgRef,
	overlayId,
	overlayCacheRef,
	scale,
	offsetX,
	offsetY,
	finalCanvasRef,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const bufRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		if (!(avatarDataUrl && avatarImgRef.current)) {
			const p = PREVIEW_MAX;
			canvas.width = p;
			canvas.height = p;
			ctx.fillStyle = "#eef1f5";
			ctx.fillRect(0, 0, p, p);
			ctx.fillStyle = "#94a3b8";
			ctx.font = "15px system-ui, -apple-system, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("点击上方按钮上传头像", p / 2, p / 2);
			finalCanvasRef.current = null;
			return;
		}

		const avatar = avatarImgRef.current;
		const size = Math.min(avatar.width, avatar.height);
		const target = Math.min(PREVIEW_MAX, size);

		// @performance 复用 buffer canvas，避免频繁 createElement
		let inner = bufRef.current;
		if (!inner) {
			inner = document.createElement("canvas");
			bufRef.current = inner;
		}
		inner.width = size;
		inner.height = size;
		const ic = inner.getContext("2d");
		if (!ic) return;

		ic.imageSmoothingEnabled = true;
		ic.imageSmoothingQuality = "high";
		ic.drawImage(avatar, 0, 0, size, size);

		const cached = overlayCacheRef.current.get(overlayId);
		if (cached?.complete && cached.naturalWidth > 0) {
			const ls = size * (scale / 100);
			const isChick = overlayId === "chick";
			const lx = isChick ? 0 + offsetX : size - ls + offsetX;
			const ly = size - ls + offsetY;
			ic.drawImage(cached, lx, ly, ls, ls);
		}

		finalCanvasRef.current = inner;

		canvas.width = target;
		canvas.height = target;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.clearRect(0, 0, target, target);
		ctx.drawImage(inner, 0, 0, target, target);
	}, [avatarDataUrl, avatarImgRef, overlayId, overlayCacheRef, scale, offsetX, offsetY, finalCanvasRef]);

	return (
		<div className="preview-area">
			<canvas ref={canvasRef} className="preview-canvas" />
		</div>
	);
});
