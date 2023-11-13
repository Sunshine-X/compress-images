const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const defaultQualitySettings = {
  '.jpg': 80,
  '.jpeg': 80,
  '.png': 50,
  '.gif': 9
};

const formatSizeUnits = (bytes) => {
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return bytes + ' Bytes';
  }
}

let compressionResults = []; // 定义一个全局数组来收集所有的压缩结果

/**
 * Compress a single image and return the compression result.
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

/**
 * Generate the content of the markdown file from the compression results.
 */
const generateMdContent = (results) => {
  const header = '| 文件名 | 压缩前 | 压缩后 | 压缩率 |\n| --- | --- | --- | --- |\n';
  const rows = results.map(({ file, originalSize, newSize, compressionRatio }) =>
    `| ${file} | ${originalSize} | ${newSize} | ${compressionRatio} |\n`
  ).join('');
  return header + rows;
};

/**
 * Compress all images in a directory and its subdirectories.
 */
const compressImages = async (dir, outputDirRoot = null, qualitySettings = defaultQualitySettings) => {
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
  return outputDirRoot;
};

/**
 * Write the compression results to a markdown file.
 */
const writeCompressionResults = (outputDirRoot) => {
  if (compressionResults.length > 0) {
    const mdContent = generateMdContent(compressionResults);
    fs.writeFileSync(path.join(outputDirRoot, '压缩结果.md'), mdContent);
  }
};

compressImages('./src').then(outputDirRoot => writeCompressionResults(outputDirRoot));