const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
/**
 *  压缩前后文件大小格式化的函数
*/
const formatSizeUnits = (bytes) => {
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return bytes + ' Bytes';
  }
}

/**
 * 压缩单个图像并返回压缩结果。
 */
const compressSingleImage = async (filePath, outputPath, ext, qualitySettings) => {
  const stats = fs.statSync(filePath);
  const { size: originalSize } = stats;
  const quality = qualitySettings[ext];
  await sharp(filePath)
    .jpeg({ quality })
    .toFile(outputPath);
  const { size: newSize } = fs.statSync(outputPath);

  return {
    file: path.relative(process.cwd(), filePath), // 使用完整路径
    originalSize: formatSizeUnits(originalSize),
    newSize: formatSizeUnits(newSize),
    compressionRatio: ((1 - newSize / originalSize) * 100).toFixed(2) + '%'
  };
};

let compressionResults = []; // 定义一个全局数组来收集所有的压缩结果
/**
 * Compress all images in a directory and its subdirectories.
 */
const compressImages = async (dir, outputDirRoot, qualitySettings) => {
  if (!outputDirRoot) {
    outputDirRoot = path.join(path.dirname(dir), path.basename(dir) + '_compressed');
  }
  const files = fs.readdirSync(dir);
  const outputDir = path.join(outputDirRoot, path.relative(process.cwd(), dir)); // 保持原始文件的目录结构

  for (const file of files) {
    const filePath = path.join(dir, file);
    const outputPath = path.join(outputDir, file);
    const ext = path.extname(file).toLowerCase();

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      await compressImages(filePath, outputDirRoot, qualitySettings);
    } else if (ext.match(/.(jpg|jpeg|png|gif)$/i)) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const result = await compressSingleImage(filePath, outputPath, ext, qualitySettings);
      compressionResults.push(result);
    }
  }
  return { outputDirRoot, compressionResults };
};

module.exports = {
  compressImages
}