interface Props {
  onClick: () => void;
  disabled: boolean;
  pending?: boolean;
}

export function DownloadButton({ onClick, disabled, pending }: Props) {
  return (
    <button type="button" className="btn-download" onClick={onClick} disabled={disabled}>
      <i className={`fas ${pending ? 'fa-spinner fa-pulse' : 'fa-download'}`} />
      {pending ? '处理中…' : '下载 PNG'}
    </button>
  );
}
