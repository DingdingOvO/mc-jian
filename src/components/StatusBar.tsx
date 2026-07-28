interface StatusMap {
	[k: string]: { loaded: boolean; failed: boolean };
}

interface Props {
	avatarError: string | null;
	overlayStatus: StatusMap;
	activeOverlayId: string;
}

export function StatusBar({ avatarError, overlayStatus, activeOverlayId }: Props) {
	if (avatarError) {
		return (
			<div className="status">
				<span className="fail">
					<i className="fas fa-exclamation-circle" /> {avatarError}
				</span>
			</div>
		);
	}
	const s = overlayStatus[activeOverlayId];
	if (!s) return null;
	if (s.failed) {
		return (
			<div className="status">
				<span className="fail">
					<i className="fas fa-exclamation-circle" /> 当前素材加载失败
				</span>
			</div>
		);
	}
	if (!s.loaded) {
		return (
			<div className="status">
				<i className="fas fa-spinner fa-pulse" /> 加载素材中…
			</div>
		);
	}
	return (
		<div className="status">
			<span className="ok">
				<i className="fas fa-check-circle" /> 素材就绪
			</span>
		</div>
	);
}
