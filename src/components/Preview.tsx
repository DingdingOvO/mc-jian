import { memo, useEffect, useRef } from 'react';

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

/** @performance 复用同一个 buffer canvas，避免每帧 createElement 内存抖动 */
let _buf: HTMLCanvasElement | null = null;
const buf = () => (_buf ??= document.createElement('canvas'));

/** @why deps 数组严格声明受 input：任何未在 deps 中的变化都不会触发重绘；
 *      配合父组件 useTransition 润滑，slider 滑动保持主线程响应 */
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 空状态
    if (!avatarDataUrl || !avatarImgRef.current) {
      const p = PREVIEW_MAX;
      canvas.width = p;
      canvas.height = p;
      ctx.fillStyle = '#eef1f5';
      ctx.fillRect(0, 0, p, p);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('点击上方按钮上传头像', p / 2, p / 2);
      finalCanvasRef.current = null;
      return;
    }

    const avatar = avatarImgRef.current;
    const size = Math.min(avatar.width, avatar.height);
    const target = pFitSize(size, PREVIEW_MAX);
    const inner = buf();
    inner.width = size;
    inner.height = size;
    const ic = inner.getContext('2d');
    if (!ic) return;
    // @performance 头像用平滑插值（照片/一般图），挂件素材用 nearest（MC 像素）
    ic.imageSmoothingEnabled = true;
    ic.imageSmoothingQuality = 'high';
    ic.drawImage(avatar, 0, 0, size, size);

    const cached = overlayCacheRef.current.get(overlayId);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      const ls = size * (scale / 100);
      // @why 小鸡放左下角，其他放右下角
      const isChick = overlayId === 'chick';
      const lx = isChick ? 0 + offsetX : size - ls + offsetX;
      const ly = size - ls + offsetY;
      // @side-effect 保持 image-smoothing 开启，确保缩放素材时不额外产生锯齿
      ic.drawImage(cached, lx, ly, ls, ls);
    }

    finalCanvasRef.current = inner;

    canvas.width = target;
    canvas.height = target;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, target, target);
    ctx.drawImage(inner, 0, 0, target, target);
  }, [avatarDataUrl, avatarImgRef, overlayId, overlayCacheRef, scale, offsetX, offsetY, finalCanvasRef]);

  return (
    <div className="preview-area">
      <canvas ref={canvasRef} className="preview-canvas" />
    </div>
  );
});

function pFitSize(src: number, max: number) {
  return Math.min(max, src);
}
