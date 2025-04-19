import { useState, useCallback } from 'react';
import { strings } from '../utils/constants';

interface CompressionOptions {
  targetSize: number;
  minFramePercent: number;
  threads: number;
}

// 尝试检测和使用Tauri API的方法
async function getTauriApi() {
  // 尝试直接从包导入
  try {
    const api = await import('@tauri-apps/api/core');
    console.log("成功从@tauri-apps/api/core导入");
    return api;
  } catch (error) {
    console.error("导入@tauri-apps/api/core失败:", error);
  }
  
  // 检查window.__TAURI__
  if (typeof window !== 'undefined' && window.__TAURI__) {
    console.log("使用window.__TAURI__");
    return {
      invoke: window.__TAURI__.invoke.bind(window.__TAURI__)
    };
  }
  
  // 检查内部API
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    console.log("使用window.__TAURI_INTERNALS__");
    return {
      invoke: window.__TAURI_INTERNALS__.invoke.bind(window.__TAURI_INTERNALS__)
    };
  }
  
  throw new Error("无法找到有效的Tauri API");
}

export function useFileCompression() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  // 使用类似src目录的方法
  const compressFile = useCallback(async (
    inputPath: string,
    outputPath: string,
    options: CompressionOptions
  ) => {
    try {
      setIsCompressing(true);
      setError(null);
      
      console.log("开始压缩文件，输入路径:", inputPath);
      console.log("输出路径:", outputPath);
      console.log("压缩选项:", options);
      
      // 获取Tauri API
      const api = await getTauriApi();
      
      // 获取文件信息
      console.log("获取文件信息...");
      const gifInfoResult = await api.invoke('get_gif_info', { 
        path: inputPath
      });
      
      console.log("文件信息结果:", gifInfoResult);
      const [originalSize, frames] = gifInfoResult as [number, number];
      console.log(`文件大小: ${originalSize} KB, 帧数: ${frames}`);
      
      // 开始压缩
      console.log("开始压缩处理...");
      const compressResult = await api.invoke('compress_gif', {
        inputPath: inputPath,
        outputPath: outputPath,
        options: {
          target_size: options.targetSize,
          min_frame_percent: options.minFramePercent,
          threads: options.threads
        }
      });
      
      console.log("压缩结果:", compressResult);
      
      // 使用类型断言处理
      const typedResult = compressResult as {
        success: boolean,
        original_size: number,
        compressed_size: number,
        output_path: string,
        message: string
      };

      setResult({
        success: typedResult.success,
        originalSize: typedResult.original_size,
        compressedSize: typedResult.compressed_size,
      });
    } catch (err) {
      console.error('压缩过程出错:', err);
      setError(strings.errorGeneric);
      setResult(null);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return {
    isCompressing,
    error,
    result,
    compressFile,
  };
}
