import re

with open('frontend/src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the whole ImageUploadModal
pattern = re.compile(r'export function ImageUploadModal\(\{ product, isAdmin, onClose, onSaved \}: ImageUploadModalProps\) \{.*?\n\}', re.DOTALL)

new_modal = """export function ImageUploadModal({ product, isAdmin, onClose, onSaved }: ImageUploadModalProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>(
    product.images && product.images.length > 0
      ? product.images.filter(i => i && i !== 'default.png' && i.startsWith('http'))
      : []
  );
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_MB = 10;

  const pickFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => ALLOWED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    if (validFiles.length < newFiles.length) {
      setError(`Some files were rejected. Only JPEG, PNG, WebP, GIF under ${MAX_MB} MB are allowed.`);
    } else {
      setError('');
    }
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
      setSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length > 0) pickFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) { setError('Please select an image first.'); return; }
    setUploading(true); setError('');
    try {
      if (isAdmin) await apiClient.adminUpdateProductImage(product.productId, files);
      else await apiClient.sellerUpdateProductImage(product.productId, files);
      setSuccess(true);
      setTimeout(() => onSaved(), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <h2 className="modal__title">📷 Product Images</h2>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
          Uploading for: <strong>{product.productName}</strong>
        </p>
        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">✅ Images uploaded successfully!</div>}

        {/* Drop Zone */}
        <div
          className={`img-upload-zone${dragging ? ' img-upload-zone--active' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {previews.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', padding: '16px' }}>
              {previews.map((p, i) => (
                 <img key={i} src={p} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
              ))}
              <div className="img-upload-preview__overlay" style={{ position: 'relative', width: '100%', marginTop: '10px', color: 'var(--primary)' }}>
                <span>Click or drag to add more</span>
              </div>
            </div>
          ) : (
            <div className="img-upload-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ margin: '10px 0 4px', fontWeight: 600 }}>Drop images here</p>
              <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>or click to browse · JPEG, PNG, WebP, GIF · max {MAX_MB} MB</p>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED.join(',')}
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files) pickFiles(Array.from(e.target.files)); }}
        />

        {files.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 8, textAlign: 'center' }}>
            Selected <strong>{files.length}</strong> new files ({(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(0)} KB total)
          </p>
        )}

        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="btn btn--primary" onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="upload-spinner" />Uploading…
              </span>
            ) : '⬆ Upload Images'}
          </button>
        </div>
      </div>
    </div>
  );
}"""

code = pattern.sub(new_modal, code)

with open('frontend/src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
