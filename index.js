#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { compressImages, writeCompressionResults } = require('./src/utils/');

const args = minimist(process.argv.slice(2), {
  alias: {
    d: 'dir',
    o: 'output',
    q: 'quality',
    h: 'help'
  },
  default: {
    dir: './src',
    output: '',
    quality: '.jpg:80,.jpeg:80,.png:50,.gif:9'
  },
  unknown: (arg) => {
    console.error(`Unknown option: ${arg}`);
    console.log('Usage: node index.js --dir <directory> --output <output directory> --quality <quality settings>');
    console.log('Example: node index.js --dir ./images --output ./compressed --quality ".jpg:80,.jpeg:80,.png:50,.gif:9"');
    process.exit(1);
  }
});

const { dir, output, quality, help } = args;

if (help) {
  console.log('Usage: node index.js --dir <directory> --output <output directory> --quality <quality settings>');
  console.log('Example: node index.js --dir ./images --output ./compressed --quality ".jpg:80,.jpeg:80,.png:50,.gif:9"');
  console.log('Options:');
  console.log('--dir, -d: The directory where the images are located. Default: ./src');
  console.log('--output, -o: The output directory for the compressed images. Default: Same level as dir');
  console.log('--quality, -q: The quality settings for different image types. Default: ".jpg:80,.jpeg:80,.png:50,.gif:9"');
  process.exit(0);
}

compressImages(dir, output, quality).then((val) => {
  return writeCompressionResults(val.outputDirRoot, val.compressionResults)
});