import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { CropPanel } from "./components/CropPanel";
import { Header } from "./components/Header";
import {
	IconArrowsH,
	IconArrowsV,
	IconBilibili,
	IconChevron,
	IconCode,
	IconCrop,
	IconDownload,
	IconExpand,
	IconEye,
	IconGithub,
	IconMonitor,
	IconMoon,
	IconSpinner,
	IconSun,
	IconUpload,
} from "./components/Icons";
import { OverlayPicker } from "./components/OverlayPicker";
import { Preview } from "./components/Preview";
import { UploadArea } from "./components/UploadArea";
import { DEFAULT_OVERLAY_ID, OVERLAYS } from "./data/overlays";
import { useImageLoader } from "./hooks/useImageLoader";
import { useOverlayCache } from "./hooks/useOverlayCache";
import type { CropRect } from "./types";

type Theme = "light" | "dark" | "system";
type ExportFmt = "png" | "jpeg" | "webp";

const DEFAULT_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };
const SCALE_MIN = 5;
const SCALE_MAX = 60;
const SCALE_STEP = 0.1;
const OFFSET_MIN = -200;
const OFFSET_MAX = 200;
const FMT_LABELS: Record<ExportFmt, string> = { png: "PNG", jpeg: "JPEG", webp: "WebP" };
const FMT_EXTS: Record<ExportFmt, string> = { png: "png", jpeg: "jpg", webp: "webp" };
const FMT_MIMES: Record<ExportFmt, string> = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };

function loadTheme(): Theme {
	try {
		const v = localStorage.getItem("mc-theme");
		if (v === "light" || v === "dark" || v === "system") return v;
	} catch {
		/* noop */
	}
	return "system";
}

function applyTheme(t: Theme) {
	const isDark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

	if (t === "system") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", t);
	}

	// 同步 color-scheme 给浏览器 UI（地址栏/状态栏/滚动条）
	document.documentElement.style.colorScheme = isDark ? "dark" : "light";

	// 同步 theme-color meta 标签（手机地址栏/状态栏颜色）
	const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	if (meta) {
		meta.content = isDark ? "#1a1814" : "#c97830";
	}

	try {
		localStorage.setItem("mc-theme", t);
	} catch {
		/* noop */
	}
}

export function App() {
	const { imgRef, dataUrl, loading: imgLoading, error: imgError, load, reset } = useImageLoader();
	const { cacheRef, status } = useOverlayCache(OVERLAYS);

	const [theme, setTheme] = useState<Theme>(loadTheme);
	const [exportFmt, setExportFmt] = useState<ExportFmt>("png");
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
	const [fmtOpen, setFmtOpen] = useState(false);
	const [exporting, setExporting] = useState(false);

	const cacheReady = status[overlayId]?.loaded ?? false;
	const img = imgRef.current;
	const overlay = cacheRef.current.get(overlayId) ?? null;

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	// 跟随系统模式时，监听 OS 主题切换
	useEffect(() => {
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [theme]);

	useEffect(() => {
		if (dataUrl && imgRef.current && !showCrop && !cropDone) {
			setShowCrop(true);
		}
	}, [dataUrl, imgRef, showCrop, cropDone]);

	const handleTheme = useCallback((t: Theme) => setTheme(t), []);

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
		if (!avatar || exporting) return;
		setExporting(true);

		const sx = cropRect.x * avatar.naturalWidth;
		const sy = cropRect.y * avatar.naturalHeight;
		const sw = cropRect.w * avatar.naturalWidth;
		const out = Math.round(sw);
		if (out < 1) {
			setExporting(false);
			return;
		}

		const c = document.createElement("canvas");
		c.width = out;
		c.height = out;
		const ctx = c.getContext("2d");
		if (!ctx) {
			setExporting(false);
			return;
		}
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

		const label = overlayId;
		const ext = FMT_EXTS[exportFmt];
		const mime = FMT_MIMES[exportFmt];
		// JPEG 不支持透明，给个白色底
		if (exportFmt === "jpeg") {
			ctx.globalCompositeOperation = "destination-over";
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, out, out);
		}

		c.toBlob(
			(blob) => {
				setExporting(false);
				if (!blob) return;

				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.download = `MC_${label}.${ext}`;
				a.href = url;
				// 挂载到 DOM 再触发，兼容旧 Safari
				a.style.display = "none";
				document.body.appendChild(a);
				a.click();
				// 延迟移除，确保下载已启动
				setTimeout(() => {
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}, 10000);
			},
			mime,
			0.92,
		);
	}, [imgRef, cacheRef, overlayId, cropRect, deferredScale, deferredOx, deferredOy, exportFmt, exporting]);

	const showPreview = dataUrl && img && cropDone;

	return (
		<>
			<Header />
			<div className="theme-bar">
				<div className="theme-toggle">
					<button
						type="button"
						className={`theme-btn${theme === "light" ? " active" : ""}`}
						onClick={() => handleTheme("light")}
						title="浅色"
					>
						<IconSun />
					</button>
					<button
						type="button"
						className={`theme-btn${theme === "dark" ? " active" : ""}`}
						onClick={() => handleTheme("dark")}
						title="深色"
					>
						<IconMoon />
					</button>
					<button
						type="button"
						className={`theme-btn${theme === "system" ? " active" : ""}`}
						onClick={() => handleTheme("system")}
						title="跟随系统"
					>
						<IconMonitor />
					</button>
				</div>
			</div>
			<main className="main">
				<section className="section">
					<div className="section-hd">
						<span className="bar" />
						<IconUpload />
						<span>1. 上传头像</span>
					</div>
					<UploadArea onFile={handleUpload} loading={imgLoading} error={imgError} />
				</section>

				{showCrop && img && (
					<section className="section">
						<div className="section-hd">
							<span className="bar" />
							<IconCrop />
							<span>2. 裁剪 (1:1)</span>
						</div>
						<CropPanel img={img} onCrop={handleCrop} onSkip={handleSkip} />
					</section>
				)}

				{showPreview && (
					<>
						<section className="section">
							<div className="section-hd">
								<span className="bar" />
								<IconEye />
								<span>3. 预览与调整</span>
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
									<IconExpand />
									<span>占比</span>
									<input
										type="range"
										min={SCALE_MIN}
										max={SCALE_MAX}
										step={SCALE_STEP}
										value={scale}
										onChange={(e) => setScale(Number(e.target.value))}
									/>
									<span className="ctrl-val">{scale}%</span>
								</label>
								<label className="ctrl">
									<IconArrowsH />
									<span>水平</span>
									<input
										type="range"
										min={OFFSET_MIN}
										max={OFFSET_MAX}
										step={1}
										value={ox}
										onChange={(e) => setOx(Number(e.target.value))}
									/>
									<span className="ctrl-val">{ox}</span>
								</label>
								<label className="ctrl">
									<IconArrowsV />
									<span>垂直</span>
									<input
										type="range"
										min={OFFSET_MIN}
										max={OFFSET_MAX}
										step={1}
										value={oy}
										onChange={(e) => setOy(Number(e.target.value))}
									/>
									<span className="ctrl-val">{oy}</span>
								</label>
							</div>
							<div className="preview-actions">
								<button type="button" className="btn-sm btn-outline" onClick={handleReCrop}>
									<IconCrop /> 重新裁剪
								</button>
								<div className="btn-dl-split">
									<button type="button" className="btn-dl" onClick={handleDownload} disabled={exporting}>
										{exporting ? <IconSpinner /> : <IconDownload />}
										{exporting ? "导出中…" : `下载 ${FMT_LABELS[exportFmt]}`}
									</button>
									<button
										type="button"
										className={`btn-dl-arrow${fmtOpen ? " open" : ""}`}
										onClick={() => setFmtOpen((v) => !v)}
										title="切换格式"
									>
										<IconChevron />
									</button>
									{fmtOpen && (
										<div className="fmt-drop">
											{(["png", "jpeg", "webp"] as ExportFmt[]).map((f) => (
												<button
													key={f}
													type="button"
													className={`fmt-opt${f === exportFmt ? " active" : ""}`}
													onClick={() => {
														setExportFmt(f);
														setFmtOpen(false);
													}}
												>
													{FMT_LABELS[f]}
												</button>
											))}
										</div>
									)}
								</div>
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

			<footer className="footer">
				<a className="footer-btn gh" href="https://github.com/DingdingOvO" target="_blank" rel="noopener noreferrer">
					<IconGithub /> DingdingOvO
				</a>
				<a className="footer-btn bi" href="https://b23.tv/zXfgdpu" target="_blank" rel="noopener noreferrer">
					<IconBilibili /> 丁丁QZ
				</a>
				<a
					className="footer-btn src"
					href="https://github.com/DingdingOvO/mc-jian"
					target="_blank"
					rel="noopener noreferrer"
				>
					<IconCode /> 源代码
				</a>
			</footer>
		</>
	);
}
