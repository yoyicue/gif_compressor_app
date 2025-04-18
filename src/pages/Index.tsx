
import { useState } from 'react';
import { DragDrop } from '../components/DragDrop';
import { Options } from '../components/Options';
import { Result } from '../components/Result';
import { InstallGuide } from '../components/InstallGuide';
import { useFileCompression } from '../hooks/useFileCompression';
import { strings, defaultOptions } from '../utils/constants';
import type { FileInfo } from '../types';

export default function Index() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [outputName, setOutputName] = useState(strings.defaultOutputSuffix);
  const [options, setOptions] = useState(defaultOptions);
  const { isCompressing, error, result, compressFile } = useFileCompression();

  const handleCompress = async () => {
    if (!file) return;

    const outputPath = file.path.replace(
      /\.gif$/,
      outputName.endsWith('.gif') ? outputName : outputName + '.gif'
    );

    await compressFile(file.path, outputPath, options);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-4">
        {!file ? (
          <DragDrop onFileAccepted={setFile} />
        ) : (
          <div className="glass rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="text-sm opacity-80">
              <p className="truncate">{file.name}</p>
            </div>

            <div>
              <label className="block text-sm mb-2">
                {strings.outputNameLabel}
              </label>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="w-full glass p-2 rounded-lg"
                disabled={isCompressing}
              />
            </div>

            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className="w-full glass py-3 rounded-lg relative overflow-hidden 
                transition-all duration-300 hover:neon-glow hover:neon-border
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompressing ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⌛</span>
                  {strings.compressing}
                </span>
              ) : (
                strings.compressionButton
              )}
            </button>
          </div>
        )}

        {file && <Options onChange={setOptions} />}

        {error && (
          <div className="glass rounded-xl p-4 text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {result && (
          <Result
            success={result.success}
            originalSize={result.originalSize}
            compressedSize={result.compressedSize}
          />
        )}
      </div>

      <InstallGuide />
    </div>
  );
}
