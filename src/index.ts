import 'dotenv/config';
import http from "http";
import { routes } from './routes';

const port = process.env.PORT || 4000;

export const server = http
  .createServer(routes)
  .listen(port, () => console.log(`\n\rServer listen port: ${port}`));