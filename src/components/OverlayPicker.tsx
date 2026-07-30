import { memo } from "react";
import type { OverlayAsset } from "../types";
import { IconChevron, IconShapes } from "./Icons";

interface Props {
	items: OverlayAsset[];
	activeId: string;
	onChange: (id: string) => void;
	cache: Map<string, HTMLImageElement>;
	open: boolean;
	onToggle: () => void;
}

export const OverlayPicker = memo(function OverlayPicker({
	items,
	activeId,
	onChange,
	cache: _cache,
	open,
	onToggle,
}: Props) {
	void _cache;
	return (
		<section className="picker">
			<button className="section-hd picker-toggle" onClick={onToggle} type="button">
				<span className="bar" />
				<IconShapes />
				4. 选择挂件
				<span className={`picker-arrow${open ? " open" : ""}`}>
					<IconChevron />
				</span>
			</button>
			<div className={`picker-body${open ? " open" : ""}`}>
				<div className="picker-grid">
					{items.map((o) => (
						<button
							key={o.id}
							type="button"
							className={`picker-card${o.id === activeId ? " active" : ""}`}
							onClick={() => onChange(o.id)}
						>
							<div className="picker-thumb">
								<img src={o.url} alt={o.label} loading="lazy" />
							</div>
							<span className="picker-label">{o.label}</span>
						</button>
					))}
				</div>
			</div>
		</section>
	);
});
