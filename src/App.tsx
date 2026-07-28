import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { CropPanel } from "./components/CropPanel";
import { Header } from "./components/Header";
import { OverlayPicker } from "./components/OverlayPicker";
import { Preview } from "./components/Preview";
import { UploadArea } from "./components/UploadArea";
import { DEFAULT_OVERLAY_ID, OVERLAYS } from "./data/overlays";
import { useImageLoader } from "./hooks/useImageLoader";
import { useOverlayCache } from "./hooks/useOverlayCache";
import type { CropRect } from "./types";

const DEFAULT_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

export function App() {
	const { imgRef, dataUrl, loading: imgLoading, load, reset } = useImageLoader();
	const { cacheRef, status } = useOverlayCache(OVERLAYS);

	const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP);
	const [showCrop, setShowCrop] = useState(false);
	const [cropDone, setCropDone] = useState(false);
	const [overlayId, setOverlayId] = useState(DEFAULT_OVERLAY_ID);
	const [scale, setScale] = useState(25);
	const [ox, setOx] = useState(0);
	const [oy, setOy] = useState(0);
	const deferredScale = useDeferredValue(scale);
	const deferredOx = useDeferredValue(ox);
	const deferredOy = useDeferredValue(oy);
	const [pickerOpen, setPickerOpen] = useState(true);

	const cacheReady = status[overlayId]?.loaded ?? false;
	const img = imgRef.current;
	const overlay = cacheRef.current.get(overlayId) ?? null;

	useEffect(() => {
		if (dataUrl && imgRef.current && !showCrop && !cropDone) {
			setShowCrop(true);
		}
	}, [dataUrl, imgRef, showCrop, cropDone]);

	const handleUpload = useCallback(
		(file: File) => {
			reset();
			setShowCrop(false);
			setCropDone(false);
			setCropRect(DEFAULT_CROP);
			load(file);
		},
		[reset, load],
	);

	const handleCrop = useCallback((r: CropRect) => {
		setCropRect(r);
		setShowCrop(false);
		setCropDone(true);
	}, []);

	const handleSkip = useCallback(() => {
		setShowCrop(false);
		setCropDone(true);
	}, []);

	const handleReCrop = useCallback(() => {
		setShowCrop(true);
	}, []);

	const handleDownload = useCallback(() => {
		const avatar = imgRef.current;
		const ov = cacheRef.current.get(overlayId) ?? null;
		if (!avatar) return;

		const sx = cropRect.x * avatar.naturalWidth;
		const sy = cropRect.y * avatar.naturalHeight;
		const sw = cropRect.w * avatar.naturalWidth;
		const out = Math.round(sw);
		if (out < 1) return;

		const c = document.createElement("canvas");
		c.width = out;
		c.height = out;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(avatar, sx, sy, sw, sw, 0, 0, out, out);

		if (ov) {
			const ls = out * (deferredScale / 100);
			const chick = ov.src.includes("chick");
			const lx = chick ? 0 + deferredOx : out - ls + deferredOx;
			const ly = out - ls + deferredOy;
			ctx.drawImage(ov, lx, ly, ls, ls);
		}

		const label = overlayId; // overlayId 是纯英文: le, copper_golem, chick...

		const a = document.createElement("a");
		a.download = `MC_${label}.png`;
		a.href = c.toDataURL("image/png");
		a.click();
	}, [imgRef, cacheRef, overlayId, cropRect, deferredScale, deferredOx, deferredOy]);

	const showPreview = dataUrl && img && cropDone;

	return (
		<>
			<Header />
			<main className="main">
				<section className="section">
					<div className="section-hd">
						<span className="bar" />
						<i className="fas fa-cloud-upload-alt" /> 1. 上传头像
					</div>
					<UploadArea onFile={handleUpload} loading={imgLoading} />
				</section>

				{showCrop && img && (
					<section className="section">
						<div className="section-hd">
							<span className="bar" />
							<i className="fas fa-crop-alt" /> 2. 裁剪 (1:1)
						</div>
						<CropPanel img={img} onCrop={handleCrop} onSkip={handleSkip} />
					</section>
				)}

				{showPreview && (
					<>
						<section className="section">
							<div className="section-hd">
								<span className="bar" />
								<i className="fas fa-eye" /> 3. 预览与调整
							</div>
							<Preview
								img={img}
								overlay={overlay}
								cropRect={cropRect}
								scale={deferredScale}
								ox={deferredOx}
								oy={deferredOy}
								cacheReady={cacheReady}
							/>
							<div className="controls">
								<label className="ctrl">
									<i className="fas fa-expand" />
									<span>占比</span>
									<input
										type="range"
										min={5}
										max={60}
										step={0.1}
										value={scale}
										onChange={(e) => setScale(Number(e.target.value))}
									/>
									<span className="ctrl-val">{scale}%</span>
								</label>
								<label className="ctrl">
									<i className="fas fa-arrows-alt-h" />
									<span>水平</span>
									<input
										type="range"
										min={-200}
										max={200}
										step={1}
										value={ox}
										onChange={(e) => setOx(Number(e.target.value))}
									/>
									<span className="ctrl-val">{ox}</span>
								</label>
								<label className="ctrl">
									<i className="fas fa-arrows-alt-v" />
									<span>垂直</span>
									<input
										type="range"
										min={-200}
										max={200}
										step={1}
										value={oy}
										onChange={(e) => setOy(Number(e.target.value))}
									/>
									<span className="ctrl-val">{oy}</span>
								</label>
							</div>
							<div className="preview-actions">
								<button type="button" className="btn-sm btn-outline" onClick={handleReCrop}>
									<i className="fas fa-crop-alt" /> 重新裁剪
								</button>
								<button type="button" className="btn-dl" onClick={handleDownload}>
									<i className="fas fa-download" /> 下载 PNG
								</button>
							</div>
						</section>

						<section className="section">
							<OverlayPicker
								items={OVERLAYS}
								activeId={overlayId}
								onChange={setOverlayId}
								cache={cacheRef.current}
								open={pickerOpen}
								onToggle={() => setPickerOpen((v) => !v)}
							/>
						</section>
					</>
				)}
			</main>

			{!showPreview && (
				<footer className="footer">
					<a className="footer-btn gh" href="https://github.com/DingdingOvO" target="_blank" rel="noopener noreferrer">
						<i className="fab fa-github" /> DingdingOvO
					</a>
					<a className="footer-btn bi" href="https://b23.tv/zXfgdpu" target="_blank" rel="noopener noreferrer">
						<i className="fa-brands fa-bilibili" /> 丁丁QZ
					</a>
					<a
						className="footer-btn src"
						href="https://github.com/DingdingOvO/mc-jian"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i className="fas fa-code" /> 源代码
					</a>
				</footer>
			)}
		</>
	);
}
