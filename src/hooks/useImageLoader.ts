import { useCallback, useRef, useState } from "react";

export function useImageLoader() {
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [dataUrl, setDataUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const seqRef = useRef(0);

	const load = useCallback((file: File) => {
		const seq = ++seqRef.current;

		setError(null);
		setLoading(true);

		if (imgRef.current) {
			imgRef.current.src = "";
			imgRef.current = null;
		}

		const reader = new FileReader();
		reader.onload = (ev) => {
			if (seq !== seqRef.current) return;
			const result = ev.target?.result;
			if (typeof result !== "string") {
				setError("读取失败");
				setLoading(false);
				return;
			}
			const img = new Image();
			img.onload = () => {
				if (seq !== seqRef.current) return;
				imgRef.current = img;
				setDataUrl(result);
				setLoading(false);
			};
			img.onerror = () => {
				if (seq !== seqRef.current) return;
				setError("图片解码失败");
				setLoading(false);
			};
			img.src = result;
		};
		reader.onerror = () => {
			if (seq !== seqRef.current) return;
			setError("文件读取失败");
			setLoading(false);
		};
		reader.readAsDataURL(file);
	}, []);

	const reset = useCallback(() => {
		imgRef.current = null;
		setDataUrl(null);
		setError(null);
		setLoading(false);
		seqRef.current = 0;
	}, []);

	return { imgRef, dataUrl, loading, error, load, reset };
}
