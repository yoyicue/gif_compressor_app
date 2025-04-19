import { useState, useEffect } from 'react';
import './App.css';
import { InstallGuide } from './components/InstallGuide';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [initialized, setInitialized] = useState(false);

  // 首先在App组件挂载时尝试分析环境
  useEffect(() => {
    console.log("========== App组件初始化 ==========");
    console.log("Window对象类型:", typeof window);
    
    if (typeof window !== 'undefined') {
      const tauriRelatedProps = Object.keys(window).filter(key => 
        key.includes('TAURI') || key.includes('tauri')
      );
      console.log("所有可能的Tauri相关属性:", tauriRelatedProps);
      
      // 检查各种可能的Tauri路径
      console.log("window.__TAURI__存在:", !!window.__TAURI__);
      if (window.__TAURI__) {
        console.log("window.__TAURI__.invoke存在:", typeof window.__TAURI__.invoke === 'function');
      }
      
      // 尝试从包导入
      import('@tauri-apps/api/core').then(
        tauriApi => {
          console.log("成功从@tauri-apps/api/core导入:", Object.keys(tauriApi));
          
          // 尝试调用API
          tauriApi.invoke('get_os_type').then(
            os => console.log("操作系统类型(从导入的API):", os),
            err => console.error("调用导入的API失败:", err)
          );
        },
        err => console.error("无法导入@tauri-apps/api/core:", err)
      );
    }
    
    // 给组件设置已初始化状态
    setInitialized(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <InstallGuide />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
