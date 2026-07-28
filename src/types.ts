export interface OverlayAsset {
	id: string;
	label: string;
	url: string;
	/** @why 真实素材通常是带通道的方块图，这里给出推荐基准边长用于归一化显示 */
	baseSize: number;
}

export interface CropRect {
	x: number;
	y: number;
	w: number;
	h: number;
}
