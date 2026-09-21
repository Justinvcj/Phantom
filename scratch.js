const https = require('https');
https.get('https://fathom.video', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const urls = data.match(/https:\/\/[^\s\"\'\)]+\.(png|jpg|jpeg|webp)/g);
    console.log(Array.from(new Set(urls)).slice(0, 30));
  });
});
