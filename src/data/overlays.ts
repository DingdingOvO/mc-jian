import type { OverlayAsset } from "../types";

export const OVERLAYS: OverlayAsset[] = [
	{ id: "le", label: "乐魂", url: "/assets/le.webp", baseSize: 512 },
	{ id: "copper", label: "铜傀儡", url: "/assets/copper.webp", baseSize: 1024 },
	{ id: "copper_w", label: "铜傀儡·斑驳", url: "/assets/copper-weathered.webp", baseSize: 1024 },
	{ id: "copper_r", label: "铜傀儡·锈蚀", url: "/assets/copper-rusted.webp", baseSize: 1024 },
	{ id: "copper_o", label: "铜傀儡·氧化", url: "/assets/copper-oxidized.webp", baseSize: 1024 },
	{ id: "chick", label: "小鸡", url: "/assets/chick.webp", baseSize: 256 },
	{ id: "slime", label: "硫磺史莱姆", url: "/assets/slime.webp", baseSize: 1024 },
];

export const DEFAULT_OVERLAY_ID = "le";
