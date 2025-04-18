import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import './App.css';

interface CompressOptions {
  target_size: number;
  min_frame_percent: number;
  threads: number;
}

interface CompressResult {
  success: boolean;
  original_size: number;
  compressed_size: number;
  output_path: string;
  message: string;
}

function App() {
  const [inputFile, setInputFile] = useState<string>('');
  const [outputFile, setOutputFile] = useState<string>('');
  const [targetSize, setTargetSize] = useState<number>(500);
  const [minFramePercent, setMinFramePercent] = useState<number>(10);
  const [threads, setThreads] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [gifsicleInstalled, setGifsicleInstalled] = useState<boolean>(false);
  const [gifInfo, setGifInfo] = useState<{size: number, frames: number} | null>(null);
  const [compressResult, setCompressResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string>('');
  const [osType, setOsType] = useState<string>('');

  useEffect(() => {
    // 获取操作系统类型
    invoke<string>('get_os_type')
      .then((type: string) => {
        setOsType(type);
      });
      
    // 检查gifsicle是否已安装
    invoke<boolean>('check_gifsicle_installed')
      .then((installed: boolean) => {
        setGifsicleInstalled(installed);
        if (!installed) {
          setError('未检测到gifsicle工具，请先安装它。');
        }
      });
  }, []);

  // 获取安装指导
  const getInstallGuide = () => {
    switch(osType) {
      case 'macos':
        return 'macOS系统可通过 brew install gifsicle 安装';
      case 'windows':
        return 'Windows系统请下载安装程序: https://eternallybored.org/misc/gifsicle/';
      case 'linux':
        return 'Linux系统可通过包管理器安装，如 apt install gifsicle 或 yum install gifsicle';
      default:
        return '请访问 https://www.lcdf.org/gifsicle/ 获取安装方法';
    }
  };

  // 当输入文件变化时，获取GIF信息
  useEffect(() => {
    if (inputFile) {
      setGifInfo(null);
      invoke<[number, number]>('get_gif_info', { path: inputFile })
        .then((result: [number, number]) => {
          const [size, frames] = result;
          setGifInfo({ size, frames });
          // 如果输出文件未设置，则自动设置为与输入文件名相同但加上后缀
          if (!outputFile) {
            const lastDotIndex = inputFile.lastIndexOf('.');
            if (lastDotIndex !== -1) {
              const newOutput = `${inputFile.substring(0, lastDotIndex)}_compressed${inputFile.substring(lastDotIndex)}`;
              setOutputFile(newOutput);
            }
          }
        })
        .catch((err: Error) => {
          setError(`无法获取GIF信息: ${err}`);
          setGifInfo(null);
        });
    }
  }, [inputFile, outputFile]);

  const selectInputFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'GIF图片',
          extensions: ['gif']
        }]
      });
      
      if (selected && !Array.isArray(selected)) {
        setInputFile(selected);
        setCompressResult(null);
        setError('');
      }
    } catch (err) {
      setError(`选择文件出错: ${err}`);
    }
  };

  const selectOutputFile = async () => {
    try {
      const selected = await save({
        filters: [{
          name: 'GIF图片',
          extensions: ['gif']
        }]
      });
      
      if (selected) {
        setOutputFile(selected);
      }
    } catch (err) {
      setError(`选择保存路径出错: ${err}`);
    }
  };

  const compressGif = async () => {
    if (!gifsicleInstalled) {
      setError('请先安装gifsicle工具后再试。');
      return;
    }

    if (!inputFile) {
      setError('请先选择输入文件。');
      return;
    }

    if (!outputFile) {
      setError('请先选择输出路径。');
      return;
    }

    const options: CompressOptions = {
      target_size: targetSize,
      min_frame_percent: minFramePercent,
      threads: threads
    };

    setIsCompressing(true);
    setError('');
    setCompressResult(null);

    try {
      const result = await invoke<CompressResult>('compress_gif', {
        inputPath: inputFile,
        outputPath: outputFile,
        options: options
      });
      
      setCompressResult(result);
    } catch (err) {
      setError(`压缩失败: ${err}`);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="container">
      <h1>GIF压缩工具</h1>
      
      {error && (
        <div className="error-message">
          {error}
          {!gifsicleInstalled && (
            <p className="install-guide">{getInstallGuide()}</p>
          )}
        </div>
      )}
      
      <div className="card">
        <div className="file-select">
          <h2>输入文件</h2>
          <div className="file-row">
            <input 
              type="text" 
              value={inputFile} 
              readOnly 
              placeholder="请选择GIF文件..."
            />
            <button onClick={selectInputFile} disabled={isCompressing}>
              浏览...
            </button>
          </div>
          
          {gifInfo && (
            <div className="file-info">
              <p>文件大小: {gifInfo.size.toFixed(2)} KB</p>
              <p>帧数: {gifInfo.frames}</p>
            </div>
          )}
        </div>
        
        <div className="file-select">
          <h2>输出文件</h2>
          <div className="file-row">
            <input 
              type="text" 
              value={outputFile} 
              readOnly 
              placeholder="请选择保存位置..."
            />
            <button onClick={selectOutputFile} disabled={isCompressing}>
              浏览...
            </button>
          </div>
        </div>
        
        <div className="settings">
          <h2>压缩选项</h2>
          
          <div className="setting-row">
            <label>目标大小 (KB)</label>
            <input 
              type="number" 
              value={targetSize} 
              onChange={e => setTargetSize(Number(e.target.value))}
              min="10"
              disabled={isCompressing}
            />
          </div>
          
          <div className="setting-row">
            <label>最小保留帧数百分比 (%)</label>
            <input 
              type="number" 
              value={minFramePercent} 
              onChange={e => setMinFramePercent(Number(e.target.value))}
              min="1"
              max="100"
              disabled={isCompressing}
            />
          </div>
          
          <div className="setting-row">
            <label>线程数 (0=自动)</label>
            <input 
              type="number" 
              value={threads} 
              onChange={e => setThreads(Number(e.target.value))}
              min="0"
              disabled={isCompressing}
            />
          </div>
        </div>
        
        <div className="action">
          <button 
            className="compress-button" 
            onClick={compressGif} 
            disabled={isCompressing || !inputFile || !outputFile || !gifsicleInstalled}
          >
            {isCompressing ? '压缩中...' : '开始压缩'}
          </button>
        </div>
        
        {compressResult && (
          <div className={`compress-result ${compressResult.success ? 'success' : 'failure'}`}>
            <h2>压缩结果</h2>
            <p>{compressResult.message}</p>
            <div className="result-stats">
              <p>原始大小: {compressResult.original_size.toFixed(2)} KB</p>
              <p>压缩后大小: {compressResult.compressed_size.toFixed(2)} KB</p>
              <p>压缩率: {((1 - compressResult.compressed_size / compressResult.original_size) * 100).toFixed(2)}%</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="footer">
        <p>请确保已安装gifsicle工具 | 状态: {gifsicleInstalled ? '已安装 ✅' : '未安装 ❌'}</p>
        {!gifsicleInstalled && <p className="install-guide">{getInstallGuide()}</p>}
      </div>
    </div>
  );
}

export default App; 