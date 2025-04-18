# GIF压缩器后端

这个文档介绍GIF压缩器的Rust后端实现，包括所有API接口、数据结构和核心功能。

## 技术栈

- **Rust**: 系统级编程语言，提供内存安全和并发支持
- **Tauri**: 构建跨平台桌面应用的框架
- **Image库**: 用于图像处理的Rust库
- **Gifsicle**: 核心GIF处理工具(命令行工具，需要系统安装)

## 主要依赖

```toml
[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1.0"
thiserror = "1.0"
image = "0.24"
tempfile = "3.8"
num_cpus = "1.16"
tokio = { version = "1", features = ["rt-multi-thread", "time", "fs", "macros", "process"] }
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2.2.1"
```

## API接口

### 系统环境接口

#### 1. 获取操作系统类型

检测当前运行的操作系统类型。

```rust
#[tauri::command]
fn get_os_type() -> String
```

**返回值**:
- `"windows"`: Windows操作系统
- `"macos"`: macOS操作系统
- `"linux"`: Linux操作系统
- `"unknown"`: 其他操作系统

**示例**:
```typescript
const osType = await invoke<string>('get_os_type');
```

#### 2. 检查gifsicle是否已安装

检查系统中是否安装了gifsicle命令行工具。

```rust
#[tauri::command]
fn check_gifsicle_installed() -> bool
```

**返回值**:
- `true`: gifsicle已安装
- `false`: gifsicle未安装

**示例**:
```typescript
const isInstalled = await invoke<boolean>('check_gifsicle_installed');
if (!isInstalled) {
  // 提示用户安装gifsicle
}
```

### GIF文件操作接口

#### 1. 获取GIF信息

获取GIF文件的大小(KB)和帧数。

```rust
#[tauri::command]
async fn get_gif_info(path: String) -> Result<(f64, usize), String>
```

**参数**:
- `path`: GIF文件路径

**返回值**:
- 成功: 元组 `(file_size, frame_count)`
  - `file_size`: 文件大小(KB)
  - `frame_count`: 帧数
- 失败: 错误信息

**示例**:
```typescript
try {
  const [fileSize, frameCount] = await invoke<[number, number]>('get_gif_info', { 
    path: '/path/to/file.gif' 
  });
  console.log(`大小: ${fileSize.toFixed(2)}KB, 帧数: ${frameCount}`);
} catch (error) {
  console.error('获取GIF信息失败:', error);
}
```

#### 2. 压缩GIF文件

压缩GIF文件到指定目标大小。

```rust
#[tauri::command]
async fn compress_gif(
    state: State<'_, AppState>,
    input_path: String, 
    output_path: String,
    options: CompressOptions
) -> Result<CompressResult, String>
```

**参数**:
- `state`: Tauri状态(内部使用)
- `input_path`: 输入GIF文件路径
- `output_path`: 输出GIF文件路径
- `options`: 压缩选项
  - `target_size`: 目标文件大小(KB)
  - `min_frame_percent`: 最小保留帧数百分比(1-100)
  - `threads`: 处理线程数(0=自动)

**返回值**:
- 成功: `CompressResult`对象
  - `success`: 是否成功达到目标大小
  - `original_size`: 原始文件大小(KB)
  - `compressed_size`: 压缩后大小(KB)
  - `output_path`: 输出文件路径
  - `message`: 状态消息
- 失败: 错误信息

**示例**:
```typescript
try {
  const result = await invoke<CompressResult>('compress_gif', {
    inputPath: '/path/to/input.gif',
    outputPath: '/path/to/output.gif',
    options: {
      target_size: 500,        // 500KB
      min_frame_percent: 10,   // 最少保留10%的帧
      threads: 0               // 自动使用所有可用CPU核心
    }
  });
  
  if (result.success) {
    console.log(`压缩成功! 从${result.original_size}KB减小到${result.compressed_size}KB`);
  } else {
    console.log(`部分压缩成功: ${result.message}`);
  }
} catch (error) {
  console.error('压缩失败:', error);
}
```

## 数据结构

### CompressOptions

压缩参数配置:

```rust
#[derive(Clone, Deserialize)]
pub struct CompressOptions {
    target_size: f64,        // 目标文件大小(KB)
    min_frame_percent: u32,  // 最小保留帧数百分比(1-100)
    threads: usize,          // 处理线程数(0=自动)
}
```

### CompressResult

压缩结果:

```rust
#[derive(Clone, Serialize)]
pub struct CompressResult {
    success: bool,           // 是否压缩成功(达到目标大小)
    original_size: f64,      // 原始文件大小(KB)
    compressed_size: f64,    // 压缩后大小(KB)
    output_path: String,     // 输出文件路径
    message: String,         // 状态消息
}
```

### GifError

自定义错误类型:

```rust
#[derive(Error, Debug)]
pub enum GifError {
    #[error("IO错误: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("图像处理错误: {0}")]
    Image(#[from] image::error::ImageError),
    
    #[error("GIF没有帧")]
    NoFrames,
    
    #[error("未找到gifsicle命令，请确保已安装")]
    GifsicleNotFound,
    
    #[error("gifsicle命令执行失败: {0}")]
    GifsicleExecFailed(String),
    
    #[error("输入文件不存在: {0}")]
    InputFileNotFound(String),
    
    #[error("没有找到有效的优化结果")]
    NoValidResults,
    
    #[error("临时目录创建失败: {0}")]
    TempDirFailed(String),
    
    #[error("{0}")]
    Other(String),
}
```

## 核心功能实现

后端实现了以下关键功能:

1. **帧提取和重组**: 使用Image库读取GIF帧并重组
2. **多线程优化**: 并行尝试多种压缩策略，加速处理
3. **最优解寻找**: 尝试不同的帧数和延迟配置，找到最佳平衡点
4. **Gifsicle集成**: 使用Gifsicle命令行工具进行优化
5. **临时文件管理**: 使用安全的临时文件系统，自动清理

## 优化策略

压缩过程使用多种策略来达到目标大小:

1. **基础优化**: 使用gifsicle的最高优化级别(-O3)减小文件大小
2. **帧数削减**: 通过选择性保留帧来减小文件大小(每N帧取1帧)
3. **颜色减少**: 递减的颜色表大小，在保持质量和大小之间平衡
4. **并行处理**: 同时尝试多种参数组合，选择最佳结果

## 使用示例

完整的后端API调用流程:

```typescript
// 1. 检查gifsicle是否已安装
const isGifsicleInstalled = await invoke<boolean>('check_gifsicle_installed');
if (!isGifsicleInstalled) {
  // 获取操作系统类型以提供相应安装指南
  const osType = await invoke<string>('get_os_type');
  // 显示安装指南...
  return;
}

// 2. 获取输入GIF文件信息
const [fileSize, frameCount] = await invoke<[number, number]>('get_gif_info', { 
  path: inputFilePath 
});

// 3. 压缩GIF文件
const result = await invoke<CompressResult>('compress_gif', {
  inputPath: inputFilePath,
  outputPath: outputFilePath,
  options: {
    target_size: targetSize,
    min_frame_percent: minFramePercent,
    threads: threads
  }
});

// 4. 处理结果
if (result.success) {
  // 压缩成功，显示结果
} else {
  // 部分成功或失败，显示消息
}
``` 