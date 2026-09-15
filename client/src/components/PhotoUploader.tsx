import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface PhotoUploaderProps {
  eventId: string;
  onUploadSuccess: () => void;
}

interface FilePreview {
  file: File;
  previewUrl: string;
  id: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ eventId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles: FilePreview[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff', 'image/svg+xml'];

    Array.from(files).forEach((file) => {
      if (allowedTypes.includes(file.type.toLowerCase()) || file.name.endsWith('.svg')) {
        const previewUrl = URL.createObjectURL(file);
        validFiles.push({
          file,
          previewUrl,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        });
      }
    });

    if (validFiles.length < files.length) {
      setErrorMessage('Some files were skipped because they are not supported images.');
    } else {
      setErrorMessage(null);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setSelectedFiles([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((item) => {
      formData.append('photos', item.file);
    });

    try {
      const res = await api.uploadPhotos(eventId, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (res.data.success) {
        setSuccessMessage(`Successfully uploaded ${res.data.data.count} photos!`);
        clearAll();
        onUploadSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-brand-400" />
            <span>Collaborative Multi-Photo Uploader</span>
          </h3>
          <p className="text-xs text-slate-400">
            Drag & drop raw event captures or select multiple files (JPEG, PNG, WEBP, SVG up to 25MB each)
          </p>
        </div>
        {selectedFiles.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {selectedFiles.length} file(s) staged
          </span>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-brand-400 bg-brand-500/10 scale-[0.99]'
            : 'border-white/10 hover:border-brand-500/40 bg-dark-900/40 hover:bg-dark-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.svg"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-amber-400/20 border border-brand-500/30 flex items-center justify-center text-brand-300 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="text-xs font-semibold text-slate-200">
            Click to Browse or Drag photos here
          </div>
          <div className="text-[11px] text-slate-400">
            Supports batch uploading up to 50 photos at once
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Staged File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Staged Previews ({selectedFiles.length})</span>
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="text-rose-400 hover:text-rose-300 underline font-medium disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-1">
            {selectedFiles.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-xl overflow-hidden bg-dark-900 border border-white/10 aspect-square flex flex-col"
              >
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(item.id);
                  }}
                  disabled={isUploading}
                  className="absolute top-1 right-1 p-1 rounded-full bg-dark-950/80 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-dark-950/90 p-1 text-[9px] text-slate-300 truncate">
                  {item.file.name} ({formatFileSize(item.file.size)})
                </div>
              </div>
            ))}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Uploading to Object Storage...</span>
                <span className="text-brand-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-dark-900 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading {selectedFiles.length} Photos...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Staged Photos ({selectedFiles.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
