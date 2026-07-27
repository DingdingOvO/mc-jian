import { memo, useEffect, useRef } from 'react';
import type { CropRect } from '../types';

interface Props {
  visible: boolean;
  collapsed: boolean;
  /** @why imgRef 是 ref 制的，effect 读到的一定是当前帧的最新的 */
  imgRef: { current: HTMLImageElement | null };
  onToggle: () => void;
  onVisibleChange: (visible: boolean) => void;
}

type DragMode =
  | { kind: 'move' }
  | { kind: 'resize'; dir: 'nw' | 'ne' | 'sw' | 'se' }
  | null;

const MIN_RATIO = 0.1;
const DEFAULT_CROP: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

/** @why 全部交互下沉到 document 级 listener，避免 React 重渲染时
 *      重复绑定；拖拽中用 ref 持指针 -> 零额外 re-render */
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

  // ---- 绘制（同步，直接读 ref） ----
  const draw = () => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !box || !container) return;
    const rect = container.getBoundingClientRect();
    const maxSize = Math.min(rect.width - 12, 600);
    canvas.width = maxSize;
    canvas.height = maxSize;
    const ctx = canvas.getContext('2d');
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
  };

  // ---- 挂载/尺寸变化重绘 ----
  useEffect(() => {
    if (!visible) return;
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [visible]);

  // ---- 坐标转换 ----
  const toLocal = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return null;
    const cr = el.getBoundingClientRect();
    const sx = canvas.width / (cr.width - 12);
    return {
      mx: (clientX - cr.left) / sx,
      my: (clientY - cr.top) / sx,
      size: canvas.width,
    };
  };

  // ---- document 事件（跨渲染黏性绑定） ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mode = dragRef.current;
      const start = startRef.current;
      if (!mode || !start) return;
      e.preventDefault();
      const local = toLocal(e.clientX, e.clientY);
      if (!local) return;
      const dx = (local.mx - start.px) / start.size;
      const dy = (local.my - start.py) / start.size;

      if (mode.kind === 'move') {
        cropRef.current.x = Math.max(0, Math.min(1 - start.base.w, start.base.x + dx));
        cropRef.current.y = Math.max(0, Math.min(1 - start.base.h, start.base.y + dy));
      } else {
        let nw = start.base.w, nh = start.base.h, nx = start.base.x, ny = start.base.y;
        if (mode.dir === 'ne' || mode.dir === 'se') nw = start.base.w + dx;
        if (mode.dir === 'nw' || mode.dir === 'sw') { nw = start.base.w - dx; nx = start.base.x + dx; }
        if (mode.dir === 'sw' || mode.dir === 'se') nh = start.base.h + dy;
        if (mode.dir === 'nw' || mode.dir === 'ne') { nh = start.base.h - dy; ny = start.base.y + dy; }
        if (nw < MIN_RATIO) nw = MIN_RATIO;
        if (nh < MIN_RATIO) nh = MIN_RATIO;
        const avg = (nw + nh) / 2;
        nw = nh = avg;
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
    };
    const onUp = () => {
      dragRef.current = null;
      startRef.current = null;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ---- 触摸 ----
  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      const mode = dragRef.current;
      const start = startRef.current;
      if (!mode || !start) return;
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      const local = toLocal(t.clientX, t.clientY);
      if (!local) return;
      const dx = (local.mx - start.px) / start.size;
      const dy = (local.my - start.py) / start.size;
      if (mode.kind === 'move') {
        cropRef.current.x = Math.max(0, Math.min(1 - start.base.w, start.base.x + dx));
        cropRef.current.y = Math.max(0, Math.min(1 - start.base.h, start.base.y + dy));
      } else {
        let nw = start.base.w, nh = start.base.h, nx = start.base.x, ny = start.base.y;
        if (mode.dir === 'ne' || mode.dir === 'se') nw = start.base.w + dx;
        if (mode.dir === 'nw' || mode.dir === 'sw') { nw = start.base.w - dx; nx = start.base.x + dx; }
        if (mode.dir === 'sw' || mode.dir === 'se') nh = start.base.h + dy;
        if (mode.dir === 'nw' || mode.dir === 'ne') { nh = start.base.h - dy; ny = start.base.y + dy; }
        if (nw < MIN_RATIO) nw = MIN_RATIO;
        if (nh < MIN_RATIO) nh = MIN_RATIO;
        const avg = (nw + nh) / 2;
        nw = nh = avg;
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
    };
    const onUp = () => {
      dragRef.current = null;
      startRef.current = null;
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, []);

  const beginDrag = (kind: 'move' | 'resize', dir?: 'nw' | 'ne' | 'sw' | 'se') =>
    (e: React.MouseEvent | React.TouchEvent) => {
      if (kind === 'resize' && !dir) return;
      const pt = 'touches' in e ? e.touches[0] : e;
      if (!pt) return;
      const local = toLocal(pt.clientX, pt.clientY);
      if (!local) return;
      dragRef.current = kind === 'move' ? { kind: 'move' } : { kind: 'resize', dir: dir! };
      startRef.current = {
        px: local.mx,
        py: local.my,
        base: { ...cropRef.current },
        size: local.size,
      };
      if ('preventDefault' in e) e.preventDefault();
    };

  if (!visible) return null;

  return (
    <section className={`crop-panel${collapsed ? ' is-collapsed' : ''}`}>
      <div className="crop-header">
        <span><i className="fas fa-crop-alt" /> 调整裁剪区域 (1:1)</span>
        <div className="crop-header-actions">
          <button type="button" className="toggle-btn" onClick={onToggle}>
            {collapsed ? '展开' : '收起'}
          </button>
          <button type="button" className="toggle-btn danger" onClick={() => onVisibleChange(false)}>
            <i className="fas fa-times" /> 跳过
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="crop-container" ref={containerRef}>
          <canvas ref={canvasRef} />
          <div
            className="crop-box"
            ref={boxRef}
            onMouseDown={beginDrag('move')}
            onTouchStart={beginDrag('move')}
          >
            {(['nw', 'ne', 'sw', 'se'] as const).map((d) => (
              <div
                key={d}
                className={`handle ${d}`}
                onMouseDown={beginDrag('resize', d)}
                onTouchStart={beginDrag('resize', d)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
});
