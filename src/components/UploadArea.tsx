import { memo, useCallback, useRef, useState } from "react";
import { IconAlertCircle, IconCheck, IconImage, IconSpinner, IconUpload } from "./Icons";

interface Props {
	onFile: (f: File) => void;
	loading: boolean;
	error: string | null;
}

export const UploadArea = memo(function UploadArea({ onFile, loading, error }: Props) {
	const [drag, setDrag] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);
	const [thumbUrl, setThumbUrl] = useState<string | null>(null);
	const cnt = useRef(0);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const f = e.target.files?.[0];
			if (f) {
				setFileName(f.name);
				const url = URL.createObjectURL(f);
				setThumbUrl(url);
				onFile(f);
			}
			e.target.value = "";
		},
		[onFile],
	);

	const onDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		cnt.current++;
		if (e.dataTransfer.types?.includes("Files")) setDrag(true);
	}, []);
	const onDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		cnt.current--;
		if (cnt.current === 0) setDrag(false);
	}, []);
	const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDrag(false);
			cnt.current = 0;
			const f = e.dataTransfer.files?.[0];
			if (f) {
				setFileName(f.name);
				const url = URL.createObjectURL(f);
				setThumbUrl(url);
				onFile(f);
			}
		},
		[onFile],
	);

	const showLoaded = thumbUrl && !loading && !error;

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: drag/drop events */
		<div
			className={`upload${drag ? " drag" : ""}${error ? " error" : ""}`}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<label htmlFor="fu">
				{showLoaded ? (
					<>
						<div className="upload-icon">
							<IconImage />
						</div>
						<span className="upload-text">{fileName}</span>
						<span className="upload-hint">点击重新选择</span>
					</>
				) : (
					<>
						<div className="upload-icon">
							{loading ? <IconSpinner /> : error ? <IconAlertCircle /> : drag ? <IconCheck /> : <IconUpload />}
						</div>
						<span className="upload-text">
							{loading ? "处理中..." : drag ? "松开上传" : error ? error : "选择或拖拽头像"}
						</span>
						{!(loading || drag || error) && <span className="upload-hint">JPG / PNG / WebP</span>}
					</>
				)}
			</label>
			<input id="fu" type="file" accept="image/*" hidden onChange={onChange} />
		</div>
	);
});
