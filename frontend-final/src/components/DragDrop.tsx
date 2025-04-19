
import { useDropzone } from '../hooks/useDropzone';
import { strings } from '../utils/constants';
import type { FileInfo } from '../types';

interface DragDropProps {
  onFileAccepted: (fileInfo: FileInfo) => void;
}

export function DragDrop({ onFileAccepted }: DragDropProps) {
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
      <p className="text-xl font-medium mb-4">
        {isDragActive ? strings.dragActive : strings.dragDropTitle}
      </p>
    </div>
  );
}
