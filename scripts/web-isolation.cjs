// expo-sqlite on web needs SharedArrayBuffer, which the browser only enables
// when the document is cross-origin isolated. Metro's enhanceMiddleware covers
// bundle responses, but the SPA HTML is sent earlier and would otherwise omit
// these headers.
const { ServerResponse } = require('node:http');

function applyIsolationHeaders(response) {
  if (response.headersSent) return;
  try {
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  } catch {
    // A response can flush headers between the check and setHeader.
  }
}

const originalWriteHead = ServerResponse.prototype.writeHead;
ServerResponse.prototype.writeHead = function writeHeadWithIsolation(...args) {
  applyIsolationHeaders(this);
  return originalWriteHead.apply(this, args);
};

const originalEnd = ServerResponse.prototype.end;
ServerResponse.prototype.end = function endWithIsolation(...args) {
  applyIsolationHeaders(this);
  return originalEnd.apply(this, args);
};
