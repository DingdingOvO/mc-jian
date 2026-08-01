import { useEffect, useRef, useState } from "react";
import type { OverlayAsset } from "../types";

interface OverlayState {
	loaded: boolean;
}

export function useOverlayCache(overlays: OverlayAsset[]) {
	const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
	const [status, setStatus] = useState<Record<string, OverlayState>>({});

	useEffect(() => {
		let alive = true;
		const cache = cacheRef.current;

		const init: Record<string, OverlayState> = {};
		for (const o of overlays) {
			init[o.id] = { loaded: cache.has(o.id) };
		}
		setStatus(init);

		for (const o of overlays) {
			if (cache.has(o.id)) continue;
			const img = new Image();
			img.onload = () => {
				if (!alive) return;
				cache.set(o.id, img);
				setStatus((s) => ({ ...s, [o.id]: { loaded: true } }));
			};
			img.onerror = () => {
				if (!alive) return;
				setStatus((s) => ({ ...s, [o.id]: { loaded: false } }));
			};
			img.src = o.url;
		}

		return () => {
			alive = false;
		};
	}, [overlays]);

	return { cacheRef, status };
}
