import type { OverlayAsset } from "../types";

// @why 归档 2.zip + 外层目录里的全部素材都汇入此处；
//      UI 通过这个数组渲染"+1 列"选择器，新增素材只需要追加
export const OVERLAYS: ReadonlyArray<OverlayAsset> = [
	{
		id: "le",
		label: "乐魂",
		url: "/assets/le.png",
		baseSize: 512,
	},
	{
		id: "copper_golem",
		label: "铜傀儡",
		url: "/assets/copper_golem.png",
		baseSize: 1024,
	},
	{
		id: "weathered_golem",
		label: "铜傀儡·斑驳",
		url: "/assets/weathered_golem.png",
		baseSize: 1024,
	},
	{
		id: "rusted_golem",
		label: "铜傀儡·锈蚀",
		url: "/assets/rusted_golem.png",
		baseSize: 1024,
	},
	{
		id: "oxidized_golem",
		label: "铜傀儡·氧化",
		url: "/assets/oxidized_golem.png",
		baseSize: 1024,
	},
	{
		id: "chick",
		label: "小鸡",
		url: "/assets/chick.png",
		baseSize: 256,
	},
];

export const DEFAULT_OVERLAY_ID = "le";
