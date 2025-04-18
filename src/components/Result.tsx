
import { strings } from '../utils/constants';
import { formatKB, calculateCompressionRatio } from '../utils/format';

interface ResultProps {
  success: boolean;
  originalSize: number;
  compressedSize: number;
}

export function Result({ success, originalSize, compressedSize }: ResultProps) {
  const ratio = calculateCompressionRatio(originalSize, compressedSize);

  return (
    <div className="result-card glass rounded-xl p-6 mt-4 w-[420px] animate-fade-in">
      <div className="flex items-center justify-center mb-4">
        <span className={success ? 'text-green-500' : 'text-red-500'}>
          {success ? '✓' : '✕'}
        </span>
        <span className="ml-2 text-lg">
          {success ? strings.resultSuccess : strings.resultFailure}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>{strings.originalSize}:</span>
          <span>{formatKB(originalSize)} KB</span>
        </div>
        <div className="flex justify-between">
          <span>{strings.compressedSize}:</span>
          <span>{formatKB(compressedSize)} KB</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>{strings.compressionRatio}:</span>
          <span>{ratio}%</span>
        </div>
      </div>
    </div>
  );
}
