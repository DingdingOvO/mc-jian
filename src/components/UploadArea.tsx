import { memo, useCallback, useRef, useState } from "react";
import { IconCheck, IconSpinner, IconUpload } from "./Icons";

interface Props {
	onFile: (f: File) => void;
	loading: boolean;
}

export const UploadArea = memo(function UploadArea({ onFile, loading }: Props) {
	const [drag, setDrag] = useState(false);
	const cnt = useRef(0);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const f = e.target.files?.[0];
			if (f) onFile(f);
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
			if (f) onFile(f);
		},
		[onFile],
	);

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: drag/drop events */
		<div
			className={`upload${drag ? " drag" : ""}`}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<label htmlFor="fu">
				<div className="upload-icon">{loading ? <IconSpinner /> : drag ? <IconCheck /> : <IconUpload />}</div>
				<span className="upload-text">{loading ? "处理中..." : drag ? "松开上传" : "选择或拖拽头像"}</span>
				<span className="upload-hint">JPG / PNG / WebP</span>
			</label>
			<input id="fu" type="file" accept="image/*" hidden onChange={onChange} />
		</div>
	);
});
