import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import { OVERLAYS, DEFAULT_OVERLAY_ID } from './data/overlays';
import { useImageLoader } from './hooks/useImageLoader';
import { useOverlayCache } from './hooks/useOverlayCache';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { OverlayPicker } from './components/OverlayPicker';
import { CropPanel } from './components/CropPanel';
import { Preview } from './components/Preview';
import { ControlSlider } from './components/ControlSlider';
import { DownloadButton } from './components/DownloadButton';
import { StatusBar } from './components/StatusBar';

export function App() {
  const { imgRef, dataUrl: avatarDataUrl, loading: avatarLoading, error: avatarError, load, reset } = useImageLoader();
  const { cacheRef: overlayCache, status: overlayStatus } = useOverlayCache(OVERLAYS);

  const [cropVisible, setCropVisible] = useState(false);
  const [overlayId, setOverlayId] = useState<string>(DEFAULT_OVERLAY_ID);
  const [scale, setScale] = useState(25);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [, startTransition] = useTransition();

  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeOverlay = useMemo(
    () => OVERLAYS.find((o) => o.id === overlayId) ?? OVERLAYS[0],
    [overlayId],
  );

  const handleScale = useCallback((v: number) => startTransition(() => setScale(v)), []);
  const handleOffsetX = useCallback((v: number) => startTransition(() => setOffsetX(v)), []);
  const handleOffsetY = useCallback((v: number) => startTransition(() => setOffsetY(v)), []);

  const handleUpload = useCallback(
    (file: File) => {
      reset();
      load(file);
      setCropVisible(true);
      setCollapsed(false);
    },
    [load, reset],
  );

  const handleCropChange = useCallback((visible: boolean) => {
    setCropVisible(visible);
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = finalCanvasRef.current;
    if (!canvas) { window.alert('请先上传头像'); return; }
    const a = document.createElement('a');
    a.download = `MC挂件_${activeOverlay.label}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }, [activeOverlay.label]);

  return (
    <>
      <Header />

      <main className="container">

        <div className="section-head">
          <span className="bar" />
          <i className="fas fa-cloud-upload-alt" />
          上传头像
        </div>
        <UploadArea onFile={handleUpload} loading={avatarLoading} />

        {avatarDataUrl && (
          <CropPanel
            visible={cropVisible}
            collapsed={collapsed}
            imgRef={imgRef}
            onToggle={() => setCollapsed((v) => !v)}
            onVisibleChange={handleCropChange}
          />
        )}

        <Preview
          avatarDataUrl={avatarDataUrl}
          avatarImgRef={imgRef}
          overlayId={overlayId}
          overlayCacheRef={overlayCache}
          scale={scale}
          offsetX={offsetX}
          offsetY={offsetY}
          finalCanvasRef={finalCanvasRef}
        />

        <div className="section-head">
          <span className="bar" />
          <i className="fas fa-shapes" />
          选择挂件
        </div>
        <OverlayPicker
          overlays={OVERLAYS}
          status={overlayStatus}
          activeId={overlayId}
          onChange={setOverlayId}
        />

        <div className="section-head">
          <span className="bar" />
          <i className="fas fa-sliders-h" />
          调整位置
        </div>
        <div className="controls">
          <ControlSlider label="大小" icon="expand" min={5} max={60} step={0.5} value={scale} unit="%" onChange={handleScale} />
          <ControlSlider label="水平偏移" icon="arrows-alt-h" min={-200} max={200} step={1} value={offsetX} onChange={handleOffsetX} />
          <ControlSlider label="垂直偏移" icon="arrows-alt-v" min={-200} max={200} step={1} value={offsetY} onChange={handleOffsetY} />
        </div>

        <DownloadButton onClick={handleDownload} disabled={!avatarDataUrl} />

        <StatusBar avatarError={avatarError} overlayStatus={overlayStatus} activeOverlayId={overlayId} />
      </main>

      <footer className="site-footer">
        <address>
          <a className="footer-btn gh" href="https://github.com/DingdingOvO" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github" /> DingdingOvO
          </a>
        </address>
        <a className="footer-btn" href="https://github.com/DingdingOvO/mc-jian" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-code" /> 源代码
        </a>
        <a className="footer-btn" href="https://b23.tv/zXfgdpu" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-bilibili" /> 作者主页
        </a>
      </footer>
    </>
  );
}
