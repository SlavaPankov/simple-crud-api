import 'dotenv/config';
import http from "http";
import { routes } from './routes';

const severPort = process.env.PORT || 4000;

export const server = http
  .createServer(routes)
  .listen(severPort, () => console.log(`\n\rServer listen port: ${severPort}`));