import React, { useState } from 'react';
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';

interface CloudinaryUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'banner' | 'landscape';
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  value,
  onChange,
  label = "Upload Image",
  aspectRatio = "square",
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const uploadedUrl = await uploadToCloudinary(file, (p) => setProgress(p));
      onChange(uploadedUrl);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'banner':
        return 'aspect-[21/9]';
      case 'landscape':
        return 'aspect-[16/9]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">{label}</label>}

      {value ? (
        <div className={`relative group border border-gold-300 rounded-lg overflow-hidden bg-ivory ${getAspectClass()}`}>
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <label className="p-2 bg-white text-burgundy rounded-full cursor-pointer hover:bg-gold hover:text-burgundy transition-colors">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className={`border-2 border-dashed border-gold-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-gold hover:bg-gold-50/20 transition-all ${getAspectClass()}`}>
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                <span className="text-xs font-medium text-burgundy">Uploading... {progress}%</span>
                <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gold h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-charcoal-muted hover:text-burgundy">
                <ImageIcon className="w-8 h-8 text-gold" />
                <div className="text-center">
                  <span className="text-sm font-medium">Click to upload image</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {/* Or enter direct URL input option */}
          <div className="flex items-center space-x-2">
            <input
              type="url"
              placeholder="Or paste image URL directly..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
