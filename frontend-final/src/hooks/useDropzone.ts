import { useState, useCallback } from 'react';
import { DragEvent, ChangeEvent } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface UseDropzoneProps {
  onFileAccepted: (file: { name: string, path: string, previewUrl: string }) => void;
  accept?: string[];
}

export function useDropzone({ onFileAccepted, accept = ['.gif'] }: UseDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const createFileInfo = async (file: File, path?: string) => {
    console.log("创建文件信息，文件:", file.name);
    console.log("初始路径:", path);
    
    // 如果没有有效的path，尝试通过对话框获取文件路径
    if (!path) {
      try {
        console.log("尝试通过对话框选择文件");
        const selected = await open({
          multiple: false,
          filters: [{
            name: 'GIF图片',
            extensions: ['gif']
          }]
        });
        
        if (selected && !Array.isArray(selected)) {
          console.log("成功选择文件:", selected);
          path = selected;
        }
      } catch (err) {
        console.error("选择文件出错:", err);
      }
    }
    
    // 检查path是否存在
    console.log("最终路径:", path);
    if (!path) {
      console.error("无法获取文件路径");
      return null;
    }
    
    // 使用convertFileSrc创建预览URL
    let previewUrl;
    try {
      previewUrl = convertFileSrc(path);
      console.log("预览URL:", previewUrl);
    } catch (err) {
      console.error("创建预览URL失败:", err);
      previewUrl = URL.createObjectURL(file);
    }
    
    return { name: file.name, path, previewUrl };
  };

  const onDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && accept.some(ext => file.name.toLowerCase().endsWith(ext))) {
        console.log("接收到拖放文件:", file.name);
        // 尝试获取文件路径
        let filePath = (file as any).path || '';
        console.log("拖放文件路径:", filePath);
        
        // 创建文件信息
        const fileInfo = await createFileInfo(file, filePath);
        if (fileInfo) {
          onFileAccepted(fileInfo);
        } else {
          console.error("无法创建文件信息");
          alert("无法获取文件路径，请使用点击上传");
        }
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
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && accept.some(ext => file.name.toLowerCase().endsWith(ext))) {
        console.log("选择文件:", file.name);
        // 尝试获取文件路径，但在浏览器中这通常是空的，在Tauri中可能有值
        let filePath = (file as any).path || '';
        console.log("选择文件路径:", filePath);
        
        // 创建文件信息
        const fileInfo = await createFileInfo(file, filePath);
        if (fileInfo) {
          onFileAccepted(fileInfo);
        }
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
