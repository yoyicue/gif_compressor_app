
import { useState, useEffect } from 'react';
import { strings, defaultOptions } from '../utils/constants';

interface OptionsProps {
  onChange: (options: typeof defaultOptions) => void;
}

export function Options({ onChange }: OptionsProps) {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem('optionsOpen');
    return stored ? JSON.parse(stored) : false;
  });
  
  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {
    localStorage.setItem('optionsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const handleChange = (key: keyof typeof options, value: number) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="mt-4 w-[420px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass rounded-lg p-3 text-left flex justify-between items-center"
      >
        <span>{strings.moreOptions}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="glass rounded-lg mt-2 p-4 space-y-4">
          <div>
            <label className="block mb-2">{strings.targetSize}</label>
            <input
              type="number"
              value={options.targetSize}
              onChange={(e) => handleChange('targetSize', parseInt(e.target.value))}
              className="w-full glass p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">{strings.minFramePercent}</label>
            <input
              type="number"
              value={options.minFramePercent}
              onChange={(e) => handleChange('minFramePercent', parseInt(e.target.value))}
              className="w-full glass p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">{strings.threads}</label>
            <input
              type="number"
              value={options.threads}
              onChange={(e) => handleChange('threads', parseInt(e.target.value))}
              className="w-full glass p-2 rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
