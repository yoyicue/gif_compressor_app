
import { useDropzone } from '../hooks/useDropzone';
import { strings } from '../utils/constants';
import type { FileInfo } from '../types';
import { ImageIcon } from 'lucide-react';

interface DragDropProps {
  onFileAccepted: (fileInfo: FileInfo) => void;
  preview?: string;
}

export function DragDrop({ onFileAccepted, preview }: DragDropProps) {
  const { isDragActive, onDrop, onDragOver, onDragLeave, onFileSelect } = useDropzone({
    onFileAccepted,
  });

  return (
    <div
      className={`dropzone glass rounded-2xl p-8 text-center cursor-pointer min-h-[220px] w-[420px] 
        flex flex-col items-center justify-center transition-all duration-300
        ${isDragActive ? 'dropzone-active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".gif"
        onChange={onFileSelect}
      />
      
      {preview ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <img 
            src={preview} 
            alt="GIF Preview" 
            className="max-h-[160px] rounded-lg object-contain"
          />
          <p className="text-sm opacity-70">{strings.dragDropToReplace}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <ImageIcon className="w-12 h-12 opacity-50" />
          <p className="text-xl font-medium">
            {isDragActive ? strings.dragActive : strings.dragDropTitle}
          </p>
        </div>
      )}
    </div>
  );
}
