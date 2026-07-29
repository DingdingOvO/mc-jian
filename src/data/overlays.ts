import type { OverlayAsset } from "../types";

export const OVERLAYS: OverlayAsset[] = [
	{ id: "le", label: "乐魂", url: "/assets/le_overlay.png", baseSize: 1024 },
	{ id: "copper_golem", label: "铜傀儡", url: "/assets/copper_golem.png", baseSize: 1024 },
	{ id: "weathered_golem", label: "铜傀儡·斑驳", url: "/assets/weathered_golem.png", baseSize: 1024 },
	{ id: "rusted_golem", label: "铜傀儡·锈蚀", url: "/assets/rusted_golem.png", baseSize: 1024 },
	{ id: "oxidized_golem", label: "铜傀儡·氧化", url: "/assets/oxidized_golem.png", baseSize: 1024 },
	{ id: "chick", label: "小鸡", url: "/assets/chick.png", baseSize: 256 },
	{ id: "sulfur_slime", label: "硫磺史莱姆", url: "/assets/sulfur_slime.png", baseSize: 1024 },
];

export const DEFAULT_OVERLAY_ID = "le";
