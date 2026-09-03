const fs = require('fs');
const path = require('path');

const modules = [
  'canvas.js',
  'audio.js',
  'discord.js',
  'timezone.js',
  'timer.js',
  'qr.js',
  'nav.js',
  'fx.js',
  'views.js'
];


let bundleCode = '';
for (const mod of modules) {
  let content = fs.readFileSync(path.join(__dirname, 'src', mod), 'utf8');
  content = content.replace(/export\s+function\s+/g, 'function ');
  content = content.replace(/export\s+default\s+/g, '');
  bundleCode += `\n${content}\n`;
}

let mainContent = fs.readFileSync(path.join(__dirname, 'src', 'main.js'), 'utf8');
mainContent = mainContent.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');
bundleCode += `\n${mainContent}\n`;

function obfuscate(src) {
  const strings = [];
  const strMap = new Map();

  const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
  
  let processed = src.replace(stringRegex, (match) => {
    const raw = match.slice(1, -1);
    if (raw.length <= 1) return match;
    
    let idx;
    if (strMap.has(raw)) {
      idx = strMap.get(raw);
    } else {
      idx = strings.length;
      strings.push(raw);
      strMap.set(raw, idx);
    }
    return `_0x_get(${idx})`;
  });

  const encodedStrings = strings.map(s => Buffer.from(s).toString('base64'));

  const header = `(function(_0xroot, _0xfactory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = _0xfactory() :
  typeof define === 'function' && define.amd ? define(_0xfactory) :
  (_0xfactory());
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function() {
  'use strict';
  const _0x_pool = ${JSON.stringify(encodedStrings)};
  function _0x_get(_0xidx) {
    const _0xraw = _0x_pool[_0xidx];
    if (typeof atob !== 'undefined') {
      return decodeURIComponent(escape(atob(_0xraw)));
    }
    return Buffer.from(_0xraw, 'base64').toString('utf8');
  }
`;

  const footer = `\n});`;

  return header + processed + footer;
}

const obfuscated = obfuscate(bundleCode);
fs.writeFileSync(path.join(__dirname, 'app.js'), obfuscated, 'utf8');
