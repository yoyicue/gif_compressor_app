# GIF压缩器

一个简单高效的GIF图片压缩工具，基于Tauri和React构建的跨平台桌面应用。

![GIF压缩器](src/assets/screenshot.png)

## 功能特点

- 高效压缩GIF图片，减小文件体积
- 自定义目标大小设置
- 控制最小保留帧数百分比
- 多线程处理支持
- 实时显示压缩结果和压缩率
- 跨平台支持：Windows、macOS、Linux

## 技术栈

- **前端**：React + TypeScript
- **后端**：Rust + Tauri
- **核心工具**：基于gifsicle进行GIF处理

## 安装指南

### 前提条件

1. 确保已安装Node.js (v18+)和Rust开发环境
2. 安装gifsicle工具:
   - **macOS**: `brew install gifsicle`
   - **Windows**: 从[此处](https://eternallybored.org/misc/gifsicle/)下载安装程序
   - **Linux**: 使用包管理器安装，如`apt install gifsicle`或`yum install gifsicle`

### 从源码安装

1. 克隆仓库
   ```bash
   git clone https://github.com/your-username/gif-compressor.git
   cd gif-compressor
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 开发模式运行
   ```bash
   npm run tauri dev
   ```

4. 构建应用
   ```bash
   npm run tauri build
   ```
   构建后的应用将位于`src-tauri/target/release`目录下

## 目录结构

```
.
├── src/                # 前端React源代码
│   ├── assets/         # 静态资源文件
│   ├── App.tsx         # 主应用组件
│   ├── App.css         # 应用样式
│   ├── styles.css      # 全局样式
│   └── main.ts         # 应用入口文件
├── src-tauri/          # Tauri后端代码
│   ├── src/            # Rust源代码
│   │   ├── main.rs     # 程序入口
│   │   └── lib.rs      # 核心功能实现
│   ├── Cargo.toml      # Rust依赖配置
│   └── tauri.conf.json # Tauri配置文件
├── index.html          # HTML入口文件
├── vite.config.ts      # Vite配置
├── tsconfig.json       # TypeScript配置
└── package.json        # npm依赖和脚本
```

## API参考

项目使用Tauri的命令系统实现前后端通信。以下是Rust后端提供的主要API函数：

### 检查系统环境

```rust
// 获取操作系统类型
#[tauri::command]
fn get_os_type() -> String

// 检查gifsicle是否已安装
#[tauri::command]
fn check_gifsicle_installed() -> bool
```

### GIF文件操作

```rust
// 获取GIF信息（大小和帧数）
#[tauri::command]
async fn get_gif_info(path: String) -> Result<(f64, usize), String>

// 压缩GIF文件
#[tauri::command]
async fn compress_gif(
    state: State<'_, AppState>,
    input_path: String, 
    output_path: String,
    options: CompressOptions
) -> Result<CompressResult, String>
```

### 数据类型

```rust
// 压缩参数
struct CompressOptions {
    target_size: f64,        // 目标文件大小(KB)
    min_frame_percent: u32,  // 最小保留帧数百分比
    threads: usize,          // 处理线程数
}

// 压缩结果
struct CompressResult {
    success: bool,           // 是否压缩成功
    original_size: f64,      // 原始文件大小(KB)
    compressed_size: f64,    // 压缩后大小(KB)
    output_path: String,     // 输出文件路径
    message: String,         // 状态消息
}
```

### 前端调用示例

```typescript
// 检查gifsicle是否安装
const isInstalled = await invoke<boolean>('check_gifsicle_installed');

// 获取GIF信息
const [fileSize, frameCount] = await invoke<[number, number]>('get_gif_info', { 
  path: '/path/to/file.gif' 
});

// 压缩GIF文件
const result = await invoke<CompressResult>('compress_gif', {
  inputPath: '/path/to/input.gif',
  outputPath: '/path/to/output.gif',
  options: {
    target_size: 500,       // 500KB
    min_frame_percent: 10,  // 最少保留10%的帧
    threads: 0              // 自动使用所有可用CPU核心
  }
});
```

## 使用说明

1. 启动应用后，点击"浏览"选择需要压缩的GIF文件
2. 设置目标大小（单位：KB）
3. 调整保留帧数百分比（防止过度删减帧导致动画不流畅）
4. 设置处理线程数（0表示自动使用系统核心数）
5. 点击"开始压缩"按钮进行压缩
6. 压缩完成后查看压缩结果和压缩率