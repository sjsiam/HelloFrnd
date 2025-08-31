import { createServer } from 'http';
import next from 'next';
import { setupWebSocket } from './services/websocket.ts';

const port = parseInt(process.env.PORT || '3001', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  setupWebSocket(server);

  server.listen(port, () => {
    console.log(`> Server listening on http://localhost:${port}`);
  });
});