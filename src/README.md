# GIF压缩器前端

这个文档介绍GIF压缩器的前端实现逻辑和结构。

## 技术栈

- **React**: 用于构建用户界面的JavaScript库
- **TypeScript**: 提供类型安全的JavaScript超集
- **Tauri API**: 用于与Rust后端进行通信
- **CSS**: 自定义样式和布局

## 文件结构

```
src/
├── assets/          # 静态资源文件夹
│   ├── tauri.svg    # Tauri图标
│   ├── typescript.svg # TypeScript图标
│   └── vite.svg     # Vite图标
├── App.tsx          # 主应用组件
├── App.css          # 应用特定样式
├── main.ts          # 应用入口点
└── styles.css       # 全局样式
```

## 关键组件和功能

### App.tsx

`App.tsx`是应用的主要组件，实现以下功能：

1. **状态管理**
   - 管理输入/输出文件路径
   - 压缩选项(目标大小、最小帧数百分比、线程数)
   - 压缩状态和结果
   - gifsicle工具安装检测

2. **生命周期钩子**
   - `useEffect`检查gifsicle是否已安装
   - 监听输入文件变化以获取GIF信息
   - 自动为输出文件设置默认路径

3. **文件操作**
   - 通过Tauri的`dialog`插件实现文件选择功能
   - 读取GIF文件信息(大小、帧数)

4. **核心功能**
   - 调用Rust后端进行GIF压缩
   - 显示压缩进度和结果
   - 计算并展示压缩率

### 用户界面结构

1. **头部**: 显示应用标题和错误信息
2. **文件选择区域**: 输入文件和输出文件的选择
3. **压缩选项**: 设置压缩参数
   - 目标大小(KB)
   - 最小保留帧数百分比(%)
   - 处理线程数
4. **操作按钮**: "开始压缩"按钮
5. **结果展示**: 显示压缩结果和压缩率
6. **底部信息**: 显示gifsicle工具的安装状态

## 与后端通信

前端通过Tauri的`invoke` API与Rust后端进行通信:

```typescript
// 检查gifsicle是否安装
invoke<boolean>('check_gifsicle_installed')
  .then((installed: boolean) => {
    setGifsicleInstalled(installed);
  });

// 获取GIF信息
invoke<[number, number]>('get_gif_info', { path: inputFile })
  .then((result: [number, number]) => {
    const [size, frames] = result;
    setGifInfo({ size, frames });
  });

// 压缩GIF
invoke<CompressResult>('compress_gif', {
  inputPath: inputFile,
  outputPath: outputFile,
  options: options
})
  .then((result) => {
    setCompressResult(result);
  });
```

## 数据模型

```typescript
// 压缩选项接口
interface CompressOptions {
  target_size: number;
  min_frame_percent: number;
  threads: number;
}

// 压缩结果接口
interface CompressResult {
  success: boolean;
  original_size: number;
  compressed_size: number;
  output_path: string;
  message: string;
}
```

## 样式结构

应用使用两个CSS文件进行样式管理:

- **styles.css**: 全局样式定义，设置基本字体、颜色和布局
- **App.css**: 组件特定样式，定义卡片、表单元素和结果显示样式

## 响应式设计

界面设计考虑了不同屏幕尺寸，使用了弹性布局(Flexbox)来确保在各种设备上的良好显示效果。 