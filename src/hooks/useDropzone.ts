
import { useState, useCallback } from 'react';
import { DragEvent, ChangeEvent } from 'react';

interface UseDropzoneProps {
  onFileAccepted: (file: { name: string, path: string, previewUrl?: string }) => void;
  accept?: string[];
}

export function useDropzone({ onFileAccepted, accept = ['.gif'] }: UseDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const generatePreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && accept.some(ext => file.name.toLowerCase().endsWith(ext))) {
        const previewUrl = generatePreviewUrl(file);
        // For Tauri, we can access the file path through a custom property
        const filePath = (file as any).path;
        onFileAccepted({ name: file.name, path: filePath, previewUrl });
      }
    },
    [onFileAccepted, accept]
  );

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && accept.some(ext => file.name.toLowerCase().endsWith(ext))) {
        const previewUrl = generatePreviewUrl(file);
        // For Tauri, we can access the file path through a custom property
        const filePath = (file as any).path;
        onFileAccepted({ name: file.name, path: filePath, previewUrl });
      }
    },
    [onFileAccepted, accept]
  );

  return {
    isDragActive,
    onDrop,
    onDragOver,
    onDragLeave,
    onFileSelect,
  };
}
