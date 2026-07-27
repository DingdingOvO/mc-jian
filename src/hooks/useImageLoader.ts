import { useCallback, useRef, useState } from 'react';

/** @why 用 ref 持有 HTMLImageElement 避免重渲染，状态仅同步"可读"信号 */
export function useImageLoader() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((file: File) => {
    setError(null);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== 'string') {
        setError('读取文件失败');
        setLoading(false);
        return;
      }
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setDataUrl(result);
        setLoading(false);
      };
      img.onerror = () => {
        setError('图片解码失败');
        setLoading(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setError('文件读取失败');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const reset = useCallback(() => {
    imgRef.current = null;
    setDataUrl(null);
    setError(null);
    setLoading(false);
  }, []);

  return { imgRef, dataUrl, loading, error, load, reset };
}
