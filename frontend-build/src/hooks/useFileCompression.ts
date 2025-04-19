import { useState } from 'react';
import { strings } from '../utils/constants';
import { invoke } from '@tauri-apps/api/core';

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
      
      const [originalSize] = await invoke<[number, number]>('get_gif_info', { 
        path: inputPath,
      });

      const compressResult = await invoke<{
        success: boolean,
        original_size: number,
        compressed_size: number,
        output_path: string,
        message: string
      }>('compress_gif', {
        inputPath,
        outputPath,
        options: {
          target_size: options.targetSize,
          min_frame_percent: options.minFramePercent,
          threads: options.threads
        },
      });

      setResult({
        success: compressResult.success,
        originalSize: compressResult.original_size,
        compressedSize: compressResult.compressed_size,
      });
    } catch (err) {
      console.error('Compression error:', err);
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
