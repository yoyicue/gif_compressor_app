
export const strings = {
  dragDropTitle: "拖拽上传 GIF 或点击选择",
  dragActive: "放开以上传文件",
  compressionButton: "压缩",
  compressing: "正在压缩...",
  moreOptions: "更多选项",
  outputNameLabel: "输出文件名",
  defaultOutputSuffix: "_compressed.gif",
  installTitle: "未检测到 gifsicle",
  errorGeneric: "处理过程中出现错误",
  resultSuccess: "压缩成功",
  resultFailure: "压缩失败",
  originalSize: "原始大小",
  compressedSize: "压缩后大小",
  compressionRatio: "压缩比例",
  targetSize: "目标大小 (KB)",
  minFramePercent: "最小帧率百分比",
  threads: "线程数 (0 = 自动)",
};

export const installGuides = {
  macos: "brew install gifsicle",
  windows: "https://eternallybored.org/misc/gifsicle/",
  linux: "apt install gifsicle 或 yum install gifsicle",
  fallback: "https://www.lcdf.org/gifsicle/",
};

export const defaultOptions = {
  targetSize: 500,
  minFramePercent: 10,
  threads: 0,
};
