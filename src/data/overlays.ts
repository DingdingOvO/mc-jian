import type { OverlayAsset } from '../types';

// @why 归档 2.zip + 外层目录里的全部素材都汇入此处；
//      UI 通过这个数组渲染"+1 列"选择器，新增素材只需要追加
export const OVERLAYS: ReadonlyArray<OverlayAsset> = [
  {
    id: 'le',
    label: '乐魂',
    url: '/assets/le.png',
    baseSize: 512,
  },
  {
    id: 'copper_golem',
    label: '铜傀儡',
    url: '/assets/copper_golem.png',
    baseSize: 512,
  },
  {
    id: 'rusted_golem',
    label: '铜傀儡生锈',
    url: '/assets/铜傀儡生锈.png',
    baseSize: 512,
  },
  {
    id: 'chick',
    label: '小鸡',
    url: '/assets/chick.png',
    baseSize: 256,
  },
];

export const DEFAULT_OVERLAY_ID = 'le';
