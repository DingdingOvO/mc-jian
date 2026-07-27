import { useEffect, useRef, useState } from 'react';
import type { OverlayAsset } from '../types';

interface OverlayState {
  loaded: boolean;
  failed: boolean;
}

/** @why 多个叠加素材需要预先全部加载完成，切换时才能瞬时渲染；
 *      返回 Map 让 O(1) 读取切换状态 */
export function useOverlayCache(overlays: ReadonlyArray<OverlayAsset>) {
  const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [status, setStatus] = useState<Record<string, OverlayState>>({});

  useEffect(() => {
    const next: Record<string, OverlayState> = {};
    overlays.forEach((o) => {
      next[o.id] = {
        loaded: cacheRef.current.has(o.id),
        failed: false,
      };
    });
    setStatus(next);

    const cache = cacheRef.current;
    overlays.forEach((o) => {
      if (cache.has(o.id)) return;
      const img = new Image();
      img.onload = () => {
        cache.set(o.id, img);
        setStatus((s) => ({ ...s, [o.id]: { loaded: true, failed: false } }));
      };
      img.onerror = () => {
        setStatus((s) => ({ ...s, [o.id]: { loaded: false, failed: true } }));
      };
      img.src = o.url;
    });

    return () => {
      // @side-effect 不注销图片，组件整个生命周期只需要加载一次
    };
  }, [overlays]);

  return { cacheRef, status };
}
