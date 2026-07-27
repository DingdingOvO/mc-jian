import { memo } from 'react';

interface Props {
  label: string;
  icon: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
}

export const ControlSlider = memo(function ControlSlider({
  label, icon, min, max, step, value, unit = '', onChange,
}: Props) {
  return (
    <div className="control-item">
      <span className="label">
        <i className={`fas fa-${icon}`} />
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <span className="value">{value}{unit}</span>
    </div>
  );
});
