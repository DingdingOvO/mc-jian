import { useEffect, useRef, useState } from "react";
import type { OverlayAsset } from "../types";

interface OverlayState {
	loaded: boolean;
	failed: boolean;
}

/** @why 所有叠加素材预加载完成后切换才能瞬时渲染。
 *      返回 Map 实现 O(1) 读取。cleanup 标记防止卸载后的 setState。 */
export function useOverlayCache(overlays: ReadonlyArray<OverlayAsset>) {
	const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
	const [status, setStatus] = useState<Record<string, OverlayState>>({});

	useEffect(() => {
		let alive = true;

		const next: Record<string, OverlayState> = {};
		for (const o of overlays) {
			next[o.id] = {
				loaded: cacheRef.current.has(o.id),
				failed: false,
			};
		}
		setStatus(next);

		const cache = cacheRef.current;
		for (const o of overlays) {
			if (cache.has(o.id)) continue;
			const img = new Image();
			img.onload = () => {
				if (!alive) return;
				cache.set(o.id, img);
				setStatus((s) => ({ ...s, [o.id]: { loaded: true, failed: false } }));
			};
			img.onerror = () => {
				if (!alive) return;
				setStatus((s) => ({ ...s, [o.id]: { loaded: false, failed: true } }));
			};
			img.src = o.url;
		}

		return () => {
			alive = false;
		};
	}, [overlays]);

	return { cacheRef, status };
}
