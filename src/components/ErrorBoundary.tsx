import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(_error: Error, _info: ErrorInfo): void {}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<section className="container" style={{ textAlign: "center", padding: "40px 20px" }}>
					<p style={{ color: "#c94040", fontWeight: 600, marginBottom: 8 }}>
						<i className="fas fa-exclamation-triangle" /> 出了点问题
					</p>
					<p style={{ color: "#929aa8", fontSize: "0.85rem" }}>{this.state.error?.message ?? "未知错误"}</p>
					<button
						type="button"
						className="btn-download"
						style={{ marginTop: 16, maxWidth: 200, marginInline: "auto" }}
						onClick={() => window.location.reload()}
					>
						<i className="fas fa-redo" /> 刷新页面
					</button>
				</section>
			);
		}

		return this.props.children;
	}
}
