const localtunnel = require('localtunnel');
const fs = require('fs');
(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    fs.writeFileSync('tunnel_url.txt', tunnel.url);
    console.log('Tunnel live at:', tunnel.url);
    tunnel.on('close', () => { console.log('Tunnel closed'); });
  } catch (e) {
    console.error('Tunnel error:', e);
  }
})();