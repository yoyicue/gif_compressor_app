import { useState, useCallback } from 'react';
import { DragEvent, ChangeEvent } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';

interface UseDropzoneProps {
  onFileAccepted: (file: { name: string, path: string, previewUrl: string }) => void;
  accept?: string[];
}

export function useDropzone({ onFileAccepted, accept = ['.gif'] }: UseDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const createFileInfo = (file: File, path: string) => {
    const previewUrl = path ? convertFileSrc(path) : URL.createObjectURL(file);
    return { name: file.name, path, previewUrl };
  };

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && accept.some(ext => file.name.toLowerCase().endsWith(ext))) {
        const filePath = (file as any).path;
        onFileAccepted(createFileInfo(file, filePath));
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
        const filePath = (file as any).path;
        onFileAccepted(createFileInfo(file, filePath));
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
