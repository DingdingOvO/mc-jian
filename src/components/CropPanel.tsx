import { memo, useCallback, useEffect, useRef } from "react";
import type { CropRect } from "../types";

interface Props {
	visible: boolean;
	collapsed: boolean;
	imgRef: { current: HTMLImageElement | null };
	onToggle: () => void;
	onVisibleChange: (visible: boolean) => void;
}

type DragMode = { kind: "move" } | { kind: "resize"; dir: "nw" | "ne" | "sw" | "se" } | null;

const MIN_RATIO = 0.1;
const DEFAULT_CROP: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

const HANDLE_POSITIONS = ["nw", "ne", "sw", "se"] as const;

export const CropPanel = memo(function CropPanel({ visible, collapsed, imgRef, onToggle, onVisibleChange }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const cropRef = useRef<CropRect>(DEFAULT_CROP);
	const dragRef = useRef<DragMode>(null);
	const startRef = useRef<{
		px: number;
		py: number;
		base: CropRect;
		size: number;
	} | null>(null);

	const getClientXY = useCallback((e: MouseEvent | TouchEvent): { cx: number; cy: number } | null => {
		if ("touches" in e) {
			const t = e.touches[0];
			return t ? { cx: t.clientX, cy: t.clientY } : null;
		}
		return { cx: e.clientX, cy: e.clientY };
	}, []);

	const toLocal = useCallback((clientX: number, clientY: number) => {
		const el = containerRef.current;
		const canvas = canvasRef.current;
		if (!(el && canvas)) return null;
		const cr = el.getBoundingClientRect();
		const sx = canvas.width / (cr.width - 12);
		return {
			mx: (clientX - cr.left) / sx,
			my: (clientY - cr.top) / sx,
			size: canvas.width,
		};
	}, []);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		const box = boxRef.current;
		const container = containerRef.current;
		const img = imgRef.current;
		if (!(canvas && box && container)) return;
		const rect = container.getBoundingClientRect();
		const maxSize = Math.min(rect.width - 12, 600);
		canvas.width = maxSize;
		canvas.height = maxSize;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, maxSize, maxSize);
		if (img) {
			const ratio = Math.max(maxSize / img.width, maxSize / img.height);
			const dw = img.width * ratio;
			const dh = img.height * ratio;
			ctx.drawImage(img, (maxSize - dw) / 2, (maxSize - dh) / 2, dw, dh);
		}
		const c = cropRef.current;
		const bx = c.x * maxSize;
		const by = c.y * maxSize;
		const bw = c.w * maxSize;
		const bh = c.h * maxSize;
		box.style.left = `${bx}px`;
		box.style.top = `${by}px`;
		box.style.width = `${bw}px`;
		box.style.height = `${bh}px`;
	}, [imgRef]);

	const handleDragMove = useCallback(
		(dx: number, dy: number) => {
			const mode = dragRef.current;
			const start = startRef.current;
			if (!(mode && start)) return;
			const sx = dx / start.size;
			const sy = dy / start.size;

			if (mode.kind === "move") {
				cropRef.current.x = Math.max(0, Math.min(1 - start.base.w, start.base.x + sx));
				cropRef.current.y = Math.max(0, Math.min(1 - start.base.h, start.base.y + sy));
			} else {
				let nw = start.base.w;
				let nh = start.base.h;
				let nx = start.base.x;
				let ny = start.base.y;
				if (mode.dir === "ne" || mode.dir === "se") nw = start.base.w + sx;
				if (mode.dir === "nw" || mode.dir === "sw") {
					nw = start.base.w - sx;
					nx = start.base.x + sx;
				}
				if (mode.dir === "sw" || mode.dir === "se") nh = start.base.h + sy;
				if (mode.dir === "nw" || mode.dir === "ne") {
					nh = start.base.h - sy;
					ny = start.base.y + sy;
				}
				if (nw < MIN_RATIO) nw = MIN_RATIO;
				if (nh < MIN_RATIO) nh = MIN_RATIO;
				const avg = (nw + nh) / 2;
				nw = avg;
				nh = avg;
				if (nx < 0) nx = 0;
				if (ny < 0) ny = 0;
				if (nx + nw > 1) nx = 1 - nw;
				if (ny + nh > 1) ny = 1 - nh;
				cropRef.current.x = nx;
				cropRef.current.y = ny;
				cropRef.current.w = nw;
				cropRef.current.h = nh;
			}
			draw();
		},
		[draw],
	);

	const onPointerMove = useCallback(
		(e: MouseEvent | TouchEvent) => {
			const start = startRef.current;
			if (!start) return;
			e.preventDefault();
			const pt = getClientXY(e);
			if (!pt) return;
			const local = toLocal(pt.cx, pt.cy);
			if (!local) return;
			handleDragMove(local.mx - start.px, local.my - start.py);
		},
		[getClientXY, toLocal, handleDragMove],
	);

	const onPointerUp = useCallback(() => {
		dragRef.current = null;
		startRef.current = null;
	}, []);

	useEffect(() => {
		if (!visible) return;
		draw();
		const onResize = () => draw();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [visible, draw]);

	useEffect(() => {
		document.addEventListener("mousemove", onPointerMove);
		document.addEventListener("mouseup", onPointerUp);
		document.addEventListener("touchmove", onPointerMove, { passive: false });
		document.addEventListener("touchend", onPointerUp);
		return () => {
			document.removeEventListener("mousemove", onPointerMove);
			document.removeEventListener("mouseup", onPointerUp);
			document.removeEventListener("touchmove", onPointerMove);
			document.removeEventListener("touchend", onPointerUp);
		};
	}, [onPointerUp, onPointerMove]);

	const beginDrag =
		(kind: "move" | "resize", dir?: "nw" | "ne" | "sw" | "se") => (e: React.MouseEvent | React.TouchEvent) => {
			if (kind === "resize" && !dir) return;
			if (kind === "move" && (e.target as HTMLElement)?.classList?.contains("handle")) return;
			const pt = "touches" in e ? e.touches[0] : e;
			if (!pt) return;
			const local = toLocal(pt.clientX, pt.clientY);
			if (!local) return;
			dragRef.current = kind === "move" ? { kind: "move" } : { kind: "resize", dir: dir ?? ("ne" as const) };
			startRef.current = {
				px: local.mx,
				py: local.my,
				base: { ...cropRef.current },
				size: local.size,
			};
			if ("preventDefault" in e) e.preventDefault();
		};

	if (!visible) return null;

	return (
		<section className={`crop-panel${collapsed ? " is-collapsed" : ""}`}>
			<div className="crop-header">
				<span>
					<i className="fas fa-crop-alt" /> 调整裁剪区域 (1:1)
				</span>
				<div className="crop-header-actions">
					<button type="button" className="toggle-btn" onClick={onToggle}>
						{collapsed ? "展开" : "收起"}
					</button>
					<button type="button" className="toggle-btn danger" onClick={() => onVisibleChange(false)}>
						<i className="fas fa-times" /> 跳过
					</button>
				</div>
			</div>
			{!collapsed && (
				<div className="crop-container" ref={containerRef}>
					<canvas ref={canvasRef} />
					<section
						className="crop-box"
						ref={boxRef}
						aria-label="裁剪区域"
						onMouseDown={beginDrag("move")}
						onTouchStart={beginDrag("move")}
					>
						{HANDLE_POSITIONS.map((d) => (
							<button
								type="button"
								key={d}
								className={`handle ${d}`}
								aria-label={`${d}方向缩放`}
								onMouseDown={beginDrag("resize", d)}
								onTouchStart={beginDrag("resize", d)}
							/>
						))}
					</section>
				</div>
			)}
		</section>
	);
});
