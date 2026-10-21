'use client';

import React, { useState, useRef } from 'react';
import { uploadImageToImageKit } from '@/src/lib/clientImageUpload';

interface ImageKitUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
  shape?: 'circle' | 'square' | 'banner';
  presets?: Array<{ label: string; url: string }>;
  showToast?: (msg: string) => void;
  playPop?: (freq?: number) => void;
  className?: string;
}

export const ImageKitUploadField: React.FC<ImageKitUploadFieldProps> = ({
  value,
  onChange,
  folder = '/saqib-hub/uploads',
  label = 'Upload Image',
  hint = 'Supports PNG, JPG, WEBP, SVG • Auto-saved to ImageKit CDN',
  shape = 'square',
  presets = [],
  showToast,
  playPop,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (playPop) playPop(700);
    setIsUploading(true);
    if (showToast) showToast('⚡ Uploading image directly to ImageKit CDN...');

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const res = await uploadImageToImageKit(file, folder, `img-${Date.now()}-${cleanFileName}`);

      if (res.success && res.url) {
        onChange(res.url);
        if (playPop) playPop(880);
        if (showToast) showToast('✓ Image uploaded & saved to ImageKit CDN!');
      } else {
        if (showToast) showToast('Upload failed: ' + (res.error || 'Network error'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      if (showToast) showToast('Upload error: ' + msg);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const previewShapeClasses = {
    circle: 'w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto',
    square: 'w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md mx-auto',
    banner: 'w-full h-32 rounded-2xl object-cover border-2 border-white shadow-md',
  }[shape];

  const isImageKitUrl = Boolean(value && value.includes('imagekit.io'));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Main Upload / Preview Box */}
      <div className="rounded-2xl border-2 border-dashed border-pink-400/80 bg-gradient-to-br from-pink-50/60 via-purple-50/40 to-indigo-50/60 p-4 transition hover:border-pink-500">
        {isUploading ? (
          /* Active Upload State */
          <div className="py-6 text-center space-y-3 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg">
              <i className="fa-solid fa-cloud-arrow-up fa-bounce"></i>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                ⚡ Uploading Directly to ImageKit CDN...
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Optimizing format &amp; generating high-speed CDN URL
              </div>
            </div>
          </div>
        ) : value ? (
          /* Active Image Loaded State */
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0 relative group">
                <img
                  src={value}
                  alt={label}
                  className={previewShapeClasses}
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.5';
                  }}
                />
                {isImageKitUrl && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black text-[9px] shadow-sm">
                    CDN ✓
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                    <i className="fa-solid fa-check"></i> Image Active
                  </span>
                  {isImageKitUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-extrabold border border-pink-200">
                      <i className="fa-solid fa-bolt text-pink-500 mr-1"></i>ImageKit Hosted
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-600 truncate max-w-full sm:max-w-md bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                  {value}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-sm hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Upload New Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs transition cursor-pointer"
                  >
                    <i className="fa-solid fa-link text-indigo-500 mr-1"></i>
                    {showManualUrl ? 'Hide URL' : 'Edit URL'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (playPop) playPop(500);
                      onChange('');
                      if (showToast) showToast('Image cleared');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition cursor-pointer"
                  >
                    <i className="fa-solid fa-trash-can mr-1"></i> Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Optional manual URL editor */}
            {showManualUrl && (
              <div className="pt-2 border-t border-pink-200/80">
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="text-center py-6 px-4 cursor-pointer space-y-2.5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto text-2xl shadow-md group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors">
                Click to Upload {label} from Gallery / Files
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {hint}
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white border border-pink-200 text-slate-800 font-extrabold text-xs shadow-2xs group-hover:bg-pink-500 group-hover:text-white transition">
                <i className="fa-solid fa-folder-open"></i> Choose Image File
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-600">Quick Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                if (playPop) playPop(720);
                onChange(p.url);
                if (showToast) showToast(`Applied ${p.label}`);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                value === p.url
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white hover:bg-pink-50 text-slate-700 border border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageKitUploadField;
