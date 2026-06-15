import { useCallback, useRef, useState } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { uploadMedia } from '@/api/blog';

interface Props {
  value?: string;
  onChange: (url: string | undefined) => void;
  variant?: 'cover' | 'content' | 'avatar';
  label?: string;
}

export function ImageUploadDropzone({ value, onChange, variant = 'cover', label = 'Featured Image' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are accepted');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('File must be under 8 MB');
        return;
      }
      setError(null);
      setUploading(true);
      try {
        const result = await uploadMedia(file, variant);
        onChange(result.url);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      } catch {
        setError('Upload failed - check DO Spaces config and try again');
      } finally {
        setUploading(false);
      }
    },
    [variant, onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile],
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
        {label}
      </label>

      {value ? (
        <div className="relative glass-card overflow-hidden rounded-xl">
          <img
            src={value}
            alt="Cover"
            className="w-full object-cover"
            style={{ maxHeight: variant === 'avatar' ? '120px' : '240px' }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(2,8,24,0.7)' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--electric)', border: '1px solid var(--electric)' }}
            >
              <RefreshCw size={14} />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,107,43,0.15)', color: 'var(--orange)', border: '1px solid var(--orange)' }}
            >
              <X size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className="glass-card rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
          style={{
            minHeight: variant === 'avatar' ? '120px' : '200px',
            borderStyle: 'dashed',
            borderColor: isDragging ? 'var(--electric)' : 'var(--border)',
            background: isDragging ? 'rgba(0,212,255,0.05)' : 'var(--card)',
          }}
        >
          {uploading ? (
            <>
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--electric)', borderTopColor: 'transparent' }}
              />
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Uploading & converting to WebP…</span>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)' }}
              >
                {isDragging ? <ImageIcon size={20} style={{ color: 'var(--electric)' }} /> : <Upload size={20} style={{ color: 'var(--electric)' }} />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--white)' }}>
                  {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  JPG, PNG, WebP, GIF - max 8 MB - converted to WebP
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {error && (
        <p className="text-xs" style={{ color: 'var(--orange)' }}>
          {error}
        </p>
      )}

      {toastVisible && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          ✓ Uploaded & converted to WebP
        </div>
      )}
    </div>
  );
}
