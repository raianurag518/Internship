const fs = require('fs');
fs.mkdirSync('public', { recursive: true });
const content = fs.readFileSync('gen_html.py', 'utf8');
const start = content.indexOf("'''<!DOCTYPE html>") + 3;
const end = content.lastIndexOf("'''");
const html = content.substring(start, end);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('SUCCESS: public/index.html created. Size:', fs.statSync('public/index.html').size);