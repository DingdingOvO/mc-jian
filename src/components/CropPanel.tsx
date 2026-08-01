import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { CropRect } from "../types";
import { IconCheck, IconCrop } from "./Icons";

interface Props {
	img: HTMLImageElement;
	onCrop: (r: CropRect) => void;
	onSkip: () => void;
}

export const CropPanel = memo(function CropPanel({ img, onCrop, onSkip }: Props) {
	const wrap = useRef<HTMLDivElement>(null);
	const [s, setSState] = useState({ px: 0, py: 0, z: 1 });

	const sRef = useRef(s);
	const setS = useCallback((next: { px: number; py: number; z: number }) => {
		sRef.current = next;
		setSState(next);
	}, []);

	const drag = useRef<{ sx: number; sy: number } | null>(null);
	const pts = useRef<Map<number, { x: number; y: number }>>(new Map());
	const pinch = useRef<{ d: number; z: number; px0: number; py0: number; mx0: number; my0: number } | null>(null);

	useEffect(() => {
		const w = wrap.current?.clientWidth ?? 400;
		const fp = Math.min(w, 800) * 0.88;
		const z = Math.max(0.02, Math.min(20, fp / Math.min(img.naturalWidth, img.naturalHeight)));
		const next = { px: 0, py: 0, z };
		sRef.current = next;
		setSState(next);
	}, [img]);

	const ptrDown = useCallback((e: React.PointerEvent) => {
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

		if (pts.current.size >= 2) {
			const list = Array.from(pts.current.values());
			const dx = (list[0]?.x ?? 0) - (list[1]?.x ?? 0);
			const dy = (list[0]?.y ?? 0) - (list[1]?.y ?? 0);
			const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 30);

			const cur = sRef.current;
			const container = wrap.current;
			let mx0 = 0;
			let my0 = 0;
			if (container) {
				const cr = container.getBoundingClientRect();
				mx0 = ((list[0]?.x ?? 0) + (list[1]?.x ?? 0)) / 2 - cr.left;
				my0 = ((list[0]?.y ?? 0) + (list[1]?.y ?? 0)) / 2 - cr.top;
			}
			pinch.current = { d: dist, z: cur.z, px0: cur.px, py0: cur.py, mx0, my0 };
			drag.current = null;
		} else {
			drag.current = { sx: e.clientX, sy: e.clientY };
		}
	}, []);

	const ptrMove = useCallback(
		(e: React.PointerEvent) => {
			pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
			const p = pinch.current;
			const cur = sRef.current;

			if (p && pts.current.size >= 2) {
				const list = Array.from(pts.current.values());
				const dx = (list[0]?.x ?? 0) - (list[1]?.x ?? 0);
				const dy = (list[0]?.y ?? 0) - (list[1]?.y ?? 0);
				const dist = Math.sqrt(dx * dx + dy * dy);
				const nz = Math.max(0.02, Math.min(20, p.z * (dist / p.d)));
				const zoomScale = nz / p.z;

				const el = wrap.current;
				if (el) {
					const cr = el.getBoundingClientRect();
					const mx = ((list[0]?.x ?? 0) + (list[1]?.x ?? 0)) / 2 - cr.left;
					const my = ((list[0]?.y ?? 0) + (list[1]?.y ?? 0)) / 2 - cr.top;
					const panDx = mx - p.mx0;
					const panDy = my - p.my0;
					setS({ px: p.px0 * zoomScale + panDx, py: p.py0 * zoomScale + panDy, z: nz });
				}
				return;
			}

			const d = drag.current;
			if (!d) return;
			const next = { ...cur, px: cur.px + (e.clientX - d.sx), py: cur.py + (e.clientY - d.sy) };
			setS(next);
			drag.current = { sx: e.clientX, sy: e.clientY };
		},
		[setS],
	);

	const ptrUp = useCallback((e: React.PointerEvent) => {
		pts.current.delete(e.pointerId);
		if (pts.current.size < 2) {
			pinch.current = null;
		}
		if (pts.current.size === 1) {
			const remaining = Array.from(pts.current.values())[0];
			if (remaining) drag.current = { sx: remaining.x, sy: remaining.y };
		} else {
			drag.current = null;
		}
	}, []);

	const onWheel = useCallback(
		(e: React.WheelEvent) => {
			const cur = sRef.current;
			const ratio = e.deltaY > 0 ? 0.9 : 1.1;
			const nz = Math.max(0.02, Math.min(20, cur.z * ratio));
			const zoomScale = nz / cur.z;
			setS({ px: cur.px * zoomScale, py: cur.py * zoomScale, z: nz });
		},
		[setS],
	);

	const apply = useCallback(() => {
		const el = wrap.current;
		if (!el) return;
		const cw = el.clientWidth;
		const ch = el.clientHeight;
		const fp = Math.min(cw, ch) * 0.88;
		const fx = (cw - fp) / 2;
		const fy = (ch - fp) / 2;
		const v = sRef.current;
		const cx = (fx + fp / 2 - cw / 2 - v.px) / v.z + img.naturalWidth / 2;
		const cy = (fy + fp / 2 - ch / 2 - v.py) / v.z + img.naturalHeight / 2;
		const half = fp / v.z / 2;
		let sx = cx - half,
			sy = cy - half;
		const sw = fp / v.z;
		sx = Math.max(0, Math.min(img.naturalWidth - sw, sx));
		sy = Math.max(0, Math.min(img.naturalHeight - sw, sy));
		onCrop({
			x: sx / img.naturalWidth,
			y: sy / img.naturalHeight,
			w: sw / img.naturalWidth,
			h: sw / img.naturalHeight,
		});
	}, [img, onCrop]);

	return (
		<div className="crop">
			<div className="crop-hd">
				<span>
					<IconCrop /> 裁剪
				</span>
				<div className="crop-actions">
					<button type="button" className="btn-sm" onClick={apply}>
						<IconCheck /> 应用
					</button>
					<button type="button" className="btn-sm btn-outline" onClick={onSkip}>
						跳过
					</button>
				</div>
			</div>
			<div
				className="crop-wrap"
				ref={wrap}
				onPointerDown={ptrDown}
				onPointerMove={ptrMove}
				onPointerUp={ptrUp}
				onPointerCancel={ptrUp}
				onWheel={onWheel}
				style={{ touchAction: "none" }}
			>
				<img
					src={img.src}
					alt=""
					draggable={false}
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: `translate(calc(-50% + ${s.px}px), calc(-50% + ${s.py}px)) scale(${s.z})`,
						transformOrigin: "center center",
						maxWidth: "none",
						maxHeight: "none",
						willChange: "transform",
					}}
				/>
				<div className="crop-overlay" />
				<div className="crop-frame" />
				<span className="crop-hint">拖拽平移 / 滚轮或双指缩放</span>
			</div>
		</div>
	);
});
