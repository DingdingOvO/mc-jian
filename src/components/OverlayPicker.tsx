import { memo } from 'react';
import type { OverlayAsset } from '../types';

interface StatusMap {
  [k: string]: { loaded: boolean; failed: boolean };
}

interface Props {
  overlays: ReadonlyArray<OverlayAsset>;
  status: StatusMap;
  activeId: string;
  onChange: (id: string) => void;
}

export const OverlayPicker = memo(function OverlayPicker({ overlays, status, activeId, onChange }: Props) {
  return (
    <section className="overlay-picker" aria-label="素材选择">
      <header className="picker-header">
        <span><i className="fas fa-shapes" /> 素材选择</span>
        <em>已选：{overlays.find((o) => o.id === activeId)?.label ?? '—'}</em>
      </header>
      <div className="picker-grid">
        {overlays.map((o) => {
          const isActive = o.id === activeId;
          const s = status[o.id] ?? { loaded: false, failed: false };
          return (
            <button
              key={o.id}
              type="button"
              className={`picker-card${isActive ? ' is-active' : ''}${s.failed ? ' is-failed' : ''}`}
              onClick={() => onChange(o.id)}
            >
              <div className="picker-thumb">
                <img src={o.url} alt={o.label} loading="lazy" />
                {!s.loaded && !s.failed && <span className="picker-spinner" aria-hidden />}
                {s.failed && <span className="picker-bad" aria-hidden><i className="fas fa-exclamation-triangle" /></span>}
              </div>
              <span className="picker-label">{o.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
});
