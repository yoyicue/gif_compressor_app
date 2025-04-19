import { useEffect, useState } from 'react';
import { strings, installGuides } from '../utils/constants';
import { invoke } from '@tauri-apps/api/core';

export function InstallGuide() {
  const [show, setShow] = useState(false);
  const [osType, setOsType] = useState<'macos' | 'windows' | 'linux' | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const [isInstalled, os] = await Promise.all([
          invoke<boolean>('check_gifsicle_installed'),
          invoke<string>('get_os_type'),
        ]);

        if (!isInstalled) {
          setShow(true);
          setOsType(os as typeof osType);
        }
      } catch (error) {
        console.error('Failed to check gifsicle installation:', error);
      }
    }

    check();
  }, []);

  if (!show) return null;

  const guide = osType ? installGuides[osType] : installGuides.fallback;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto glass rounded-xl p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium mb-1">{strings.installTitle}</h3>
          <p className="text-sm opacity-90">{guide}</p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="ml-4 opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
