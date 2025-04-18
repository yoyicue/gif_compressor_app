
import { useState } from 'react';
import { strings } from '../utils/constants';

interface CompressionOptions {
  targetSize: number;
  minFramePercent: number;
  threads: number;
}

declare global {
  interface Window {
    __TAURI__: {
      invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
    };
  }
}

export function useFileCompression() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const compressFile = async (
    inputPath: string,
    outputPath: string,
    options: CompressionOptions
  ) => {
    try {
      setIsCompressing(true);
      setError(null);
      
      const [originalSize] = await window.__TAURI__.invoke<[number, number]>('get_gif_info', {
        path: inputPath,
      });

      await window.__TAURI__.invoke('compress_gif', {
        inputPath,
        outputPath,
        options,
      });

      const [compressedSize] = await window.__TAURI__.invoke<[number, number]>('get_gif_info', {
        path: outputPath,
      });

      setResult({
        success: true,
        originalSize,
        compressedSize,
      });
    } catch (err) {
      setError(strings.errorGeneric);
      setResult(null);
    } finally {
      setIsCompressing(false);
    }
  };

  return {
    isCompressing,
    error,
    result,
    compressFile,
  };
}
