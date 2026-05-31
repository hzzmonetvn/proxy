addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response(renderHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0' }
    })

    let fileName = 'downloaded_file';
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      fileName = disposition.split('filename=')[1].replace(/['"]/g, '').split(';')[0];
    } else {
      const urlObj = new URL(targetUrl);
      const parts = urlObj.pathname.split('/');
      const last = parts[parts.length - 1];
      if (last && last.includes('.')) fileName = last;
      else fileName = (urlObj.searchParams.get('file') || urlObj.searchParams.get('name') || 'downloaded_file');
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (err) {
    return new Response('Lỗi: ' + err.message, { status: 502 })
  }
}

function renderHTML() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ Proxy Download</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; }
    .card { background: rgba(255,255,255,.12); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.25); border-radius: 20px; padding: 36px; width: 100%; max-width: 460px; color: #fff; box-shadow: 0 8px 32px rgba(0,0,0,.25); text-align: center; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    p { font-size: 13px; opacity: .85; margin-bottom: 22px; }
    input { width: 100%; padding: 14px; border-radius: 12px; border: none; margin-bottom: 14px; font-size: 14px; outline: none; }
    button { width: 100%; padding: 14px; border-radius: 12px; border: none; background: #fff; color: #764ba2; font-weight: bold; font-size: 15px; cursor: pointer; transition: transform .2s; }
    button:hover { transform: scale(1.03); }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚡ Tải File Qua Cloudflare</h1>
    <p>Dán link vào ô bên dưới rồi bấm Tải để tăng tốc qua mạng lưới global.</p>
    <input id="link" type="text" placeholder="https://example.com/file.zip" />
    <button onclick="go()">Tải ngay 🚀</button>
  </div>
  <script>
    function go() {
      const link = document.getElementById('link').value.trim();
      if (!link) { alert('Nhập link đã nào!'); return; }
      window.location.href = '/?url=' + encodeURIComponent(link);
    }
  </script>
</body>
</html>`;
}