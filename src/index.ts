import 'dotenv/config';
import http from "http";

const severPort = process.env.PORT || 4000;

export const server = http
  .createServer()
  .listen(severPort, () => console.log(`\n\rServer listen port: ${severPort}`));