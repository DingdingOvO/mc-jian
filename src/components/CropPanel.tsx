import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { CropRect } from "../types";

interface Props {
	img: HTMLImageElement;
	onCrop: (r: CropRect) => void;
	onSkip: () => void;
}

/** 裁剪 — 纯 CSS transform + Pointer Events，无 canvas */
export const CropPanel = memo(function CropPanel({ img, onCrop, onSkip }: Props) {
	const wrap = useRef<HTMLDivElement>(null);
	const [s, setS] = useState({ px: 0, py: 0, z: 1 });
	const sRef = useRef(s);
	sRef.current = s;

	const drag = useRef<{ sx: number; sy: number } | null>(null);
	const pts = useRef<Map<number, { x: number; y: number }>>(new Map());
	const pinch = useRef<{ d: number; z: number } | null>(null);

	// 初始缩放
	useEffect(() => {
		const w = wrap.current?.clientWidth ?? 400;
		const fp = Math.min(w, 500) * 0.88;
		const z = Math.max(0.3, Math.min(6, fp / Math.min(img.naturalWidth, img.naturalHeight)));
		setS({ px: 0, py: 0, z });
	}, [img]);

	const ptrDown = useCallback((e: React.PointerEvent) => {
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

		if (pts.current.size >= 2) {
			const list = Array.from(pts.current.values());
			const dx = (list[0]?.x ?? 0) - (list[1]?.x ?? 0);
			const dy = (list[0]?.y ?? 0) - (list[1]?.y ?? 0);
			pinch.current = { d: Math.sqrt(dx * dx + dy * dy), z: sRef.current.z };
			drag.current = null;
		} else {
			drag.current = { sx: e.clientX, sy: e.clientY };
		}
	}, []);

	const ptrMove = useCallback((e: React.PointerEvent) => {
		pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const p = pinch.current;
		const cur = sRef.current;

		if (p && pts.current.size >= 2) {
			const list = Array.from(pts.current.values());
			const dx = (list[0]?.x ?? 0) - (list[1]?.x ?? 0);
			const dy = (list[0]?.y ?? 0) - (list[1]?.y ?? 0);
			const dist = Math.sqrt(dx * dx + dy * dy);
			const ratio = Math.max(0.7, Math.min(1.4, dist / p.d));
			const nz = Math.max(0.3, Math.min(6, p.z * ratio));

			const el = wrap.current;
			if (el) {
				const cr = el.getBoundingClientRect();
				const cx = ((list[0]?.x ?? 0) + (list[1]?.x ?? 0)) / 2 - cr.left;
				const cy = ((list[0]?.y ?? 0) + (list[1]?.y ?? 0)) / 2 - cr.top;
				const ix = (cx - cr.width / 2 - cur.px) / p.z;
				const iy = (cy - cr.height / 2 - cur.py) / p.z;
				setS({ px: cx - cr.width / 2 - ix * nz, py: cy - cr.height / 2 - iy * nz, z: nz });
			}
			return;
		}

		const d = drag.current;
		if (!d) return;
		setS({ ...cur, px: cur.px + (e.clientX - d.sx), py: cur.py + (e.clientY - d.sy) });
		drag.current = { sx: e.clientX, sy: e.clientY };
	}, []);

	const ptrUp = useCallback((e: React.PointerEvent) => {
		pts.current.delete(e.pointerId);
		if (pts.current.size < 2) pinch.current = null;
		if (pts.current.size === 0) drag.current = null;
	}, []);

	const onWheel = useCallback((e: React.WheelEvent) => {
		const cur = sRef.current;
		const el = e.currentTarget;
		const cr = el.getBoundingClientRect();
		const cx = e.clientX - cr.left;
		const cy = e.clientY - cr.top;
		const ratio = e.deltaY > 0 ? 0.9 : 1.1;
		const nz = Math.max(0.3, Math.min(6, cur.z * ratio));
		const ix = (cx - cr.width / 2 - cur.px) / cur.z;
		const iy = (cy - cr.height / 2 - cur.py) / cur.z;
		setS({ px: cx - cr.width / 2 - ix * nz, py: cy - cr.height / 2 - iy * nz, z: nz });
	}, []);

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
		<section className="crop">
			<div className="crop-hd">
				<span>
					<i className="fas fa-crop-alt" /> 裁剪
				</span>
				<div className="crop-actions">
					<button type="button" className="btn-sm" onClick={apply}>
						<i className="fas fa-check" /> 应用
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
					}}
				/>
				<div className="crop-overlay" />
				<div className="crop-frame" />
				<span className="crop-hint">拖拽 · 滚轮缩放</span>
			</div>
		</section>
	);
});
