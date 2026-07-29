import { memo } from "react";
import type { OverlayAsset } from "../types";
import { IconShapes } from "./Icons";

interface Props {
	items: OverlayAsset[];
	activeId: string;
	onChange: (id: string) => void;
	cache: Map<string, HTMLImageElement>;
	open: boolean;
	onToggle: () => void;
}

export const OverlayPicker = memo(function OverlayPicker({ items, activeId, onChange, open, onToggle }: Props) {
	return (
		<section className="picker">
			<button className="picker-hd" onClick={onToggle} type="button">
				<span className="bar" />
				<IconShapes />
				选择挂件
				<span className="picker-arrow">{open ? "▲" : "▼"}</span>
			</button>
			{open && (
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
			)}
		</section>
	);
});
