import { memo, useCallback, useRef, useState } from "react";

interface Props {
	onFile: (file: File) => void;
	loading: boolean;
}

export const UploadArea = memo(function UploadArea({ onFile, loading }: Props) {
	const [dragging, setDragging] = useState(false);
	const dragCounter = useRef(0);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) onFile(file);
			e.target.value = "";
		},
		[onFile],
	);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;
		if (e.dataTransfer.types?.includes("Files")) {
			setDragging(true);
		}
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			setDragging(false);
		}
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragging(false);
			dragCounter.current = 0;
			const file = e.dataTransfer.files?.[0];
			if (file) onFile(file);
		},
		[onFile],
	);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: drag/drop events
		<div
			className={`upload-area${dragging ? " is-dragging" : ""}`}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<label htmlFor="fileInput">
				<div className="up-icon">
					<i className={`fas ${loading ? "fa-spinner fa-pulse" : dragging ? "fa-check" : "fa-cloud-upload-alt"}`} />
				</div>
				<span className="up-text">{loading ? "处理中..." : dragging ? "松开以上传" : "选择或拖拽头像图片"}</span>
				<span className="up-hint">JPG / PNG / WebP — 拖拽或点击上传</span>
			</label>
			<input type="file" id="fileInput" accept="image/*" hidden onChange={handleChange} />
		</div>
	);
});
