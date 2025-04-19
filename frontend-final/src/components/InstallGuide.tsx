import { useEffect, useState } from 'react';
import { strings, installGuides } from '../utils/constants';

// 确保全局类型定义在项目中保持一致
declare global {
  interface Window {
    // 必须使用可选属性，因为在浏览器环境中这个对象不存在
    __TAURI__?: {
      invoke(cmd: string, args?: Record<string, unknown>): Promise<any>;
    };
    // Tauri v1也可能使用这种方式注入
    __TAURI_INVOKE__?: Function;
  }
}

// 直接检查是否在Tauri环境中运行
function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // 检查window对象上所有可能的TAURI相关属性
  const tauriProps = Object.keys(window).filter(key => key.includes('TAURI'));
  console.log("TAURI相关属性:", tauriProps);
  
  // 检查Tauri API
  const hasTauriAPI = !!window.__TAURI__;
  const hasTauriInvoke = !!window.__TAURI_INVOKE__;
  const hasTauriInvokeMethod = hasTauriAPI && typeof window.__TAURI__.invoke === 'function';
  
  console.log("Tauri环境检测:");
  console.log("- window.__TAURI__ 存在:", hasTauriAPI);
  console.log("- window.__TAURI_INVOKE__ 存在:", hasTauriInvoke);
  console.log("- window.__TAURI__.invoke 存在:", hasTauriInvokeMethod);
  
  return hasTauriAPI || hasTauriInvoke;
}

// 调用Tauri后端API的通用函数
async function callTauriAPI(command: string, args?: Record<string, unknown>): Promise<any> {
  if (!window) {
    throw new Error("window对象不存在");
  }
  
  if (window.__TAURI__ && typeof window.__TAURI__.invoke === 'function') {
    console.log(`使用window.__TAURI__.invoke调用: ${command}`);
    return window.__TAURI__.invoke(command, args);
  }
  
  if (typeof window.__TAURI_INVOKE__ === 'function') {
    console.log(`使用window.__TAURI_INVOKE__调用: ${command}`);
    return window.__TAURI_INVOKE__(command, args);
  }
  
  throw new Error("无法找到有效的Tauri API");
}

// 定义检测Tauri环境的功能
async function detectTauriEnvironment() {
  console.log("======== Tauri环境检测 ========");
  
  // 检查全局 isTauri 标志
  const hasTauriFlag = !!(globalThis || window).isTauri;
  console.log("全局isTauri标志:", hasTauriFlag);
  
  // 检查window.__TAURI__内部API
  const hasTauriInternals = !!(window && window.__TAURI_INTERNALS__);
  console.log("window.__TAURI_INTERNALS__存在:", hasTauriInternals);
  
  // 尝试直接从包导入
  try {
    const tauriApi = await import('@tauri-apps/api/core');
    console.log("成功导入@tauri-apps/api/core:", Object.keys(tauriApi));
    
    // 尝试使用invoke方法
    try {
      const osType = await tauriApi.invoke('get_os_type');
      console.log("OS类型:", osType);
      return {
        available: true,
        api: tauriApi,
        osType
      };
    } catch (invokeError) {
      console.error("调用invoke方法失败:", invokeError);
    }
  } catch (importError) {
    console.error("导入@tauri-apps/api/core失败:", importError);
  }
  
  // 检查内部调用方法
  if (hasTauriInternals && window.__TAURI_INTERNALS__.invoke) {
    try {
      const osType = await window.__TAURI_INTERNALS__.invoke('get_os_type');
      console.log("使用__TAURI_INTERNALS__获取OS类型:", osType);
      return {
        available: true,
        api: { invoke: window.__TAURI_INTERNALS__.invoke },
        osType
      };
    } catch (internalsError) {
      console.error("使用__TAURI_INTERNALS__调用失败:", internalsError);
    }
  }
  
  return { available: false };
}

export function InstallGuide() {
  const [show, setShow] = useState(false);
  const [osType, setOsType] = useState<'macos' | 'windows' | 'linux' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function initialize() {
      try {
        // 检测Tauri环境
        const env = await detectTauriEnvironment();
        
        if (!env.available) {
          console.warn('未检测到有效的Tauri环境，显示默认安装指南');
          if (isMounted) {
            setOsType('macos'); // 默认值
            setShow(true);
            setIsLoading(false);
          }
          return;
        }
        
        // 使用检测到的API
        console.log("使用检测到的Tauri API检查gifsicle安装状态");
        try {
          const isInstalled = await env.api.invoke('check_gifsicle_installed');
          console.log("gifsicle已安装:", isInstalled);
          
          if (isMounted) {
            setOsType(env.osType);
            if (!isInstalled) {
              setShow(true);
            }
            setIsLoading(false);
          }
        } catch (checkError) {
          console.error("检查gifsicle安装状态失败:", checkError);
          if (isMounted) {
            setOsType(env.osType || 'macos');
            setShow(true);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('初始化过程出错:', error);
        if (isMounted) {
          setOsType('macos');
          setShow(true);
          setIsLoading(false);
        }
      }
    }
    
    // 延迟初始化，确保有足够时间加载
    const timerId = setTimeout(initialize, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, []);

  // 加载中或不显示时返回null
  if (isLoading || !show) return null;

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
