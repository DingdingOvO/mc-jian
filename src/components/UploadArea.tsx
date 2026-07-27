interface Props {
  onFile: (file: File) => void;
  loading: boolean;
}

export function UploadArea({ onFile, loading }: Props) {
  return (
    <div className="upload-area">
      <label htmlFor="fileInput">
        <div className="up-icon">
          <i className="fas fa-cloud-upload-alt" />
        </div>
        <span className="up-text">{loading ? '处理中...' : '选择头像图片'}</span>
        <span className="up-hint">JPG / PNG / WebP</span>
      </label>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
