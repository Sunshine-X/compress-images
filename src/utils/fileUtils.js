const fs = require('fs');
const path = require('path');

/**
 * 根据压缩结果生成 `md` 文件的内容。
 */
const generateMdContent = (results) => {
  const header = '| 文件名 | 压缩前 | 压缩后 | 压缩率 |\n| --- | --- | --- | --- |\n';
  const rows = results.map(({ file, originalSize, newSize, compressionRatio }) =>
    `| ${file} | ${originalSize} | ${newSize} | ${compressionRatio} |\n`
  ).join('');
  return header + rows;
};

/**
 * 将压缩结果写入`md`文件。
 */
const writeCompressionResults = (outputDirRoot, compressionResults) => {
  if (compressionResults.length > 0) {
    const mdContent = generateMdContent(compressionResults);
    fs.writeFileSync(path.join(outputDirRoot, '压缩结果.md'), mdContent);
  }
};

module.exports = {
  writeCompressionResults
}