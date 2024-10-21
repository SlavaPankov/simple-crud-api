import http from 'http';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import "dotenv/config";
import { routes } from './routes';
import { IUser } from './types/interfaces/users';
import { users } from './db/users/users';

const port = Number(process.env.PORT) || 4000;
const CPUsLength = availableParallelism() - 1;

if (cluster.isPrimary) {
    for (let i = 0; i < CPUsLength; i++) {
        const worker = cluster.fork({ WORKER_PORT: `${port + i + 1}` })
    }

    Object.values(cluster.workers).forEach((worker) => {
        worker.on("message", (msg) => {
            if (msg.type === "updateUsers") {
                Object.values(cluster.workers).forEach((worker) => worker?.send(msg));
            }
        });
    });

    const workerPorts = [...Array(CPUsLength).keys()].map((i) => port + i + 1);
    
    let roundRobinIndex = 0;
    
    const proxyServer = http.createServer((req, res) => {
        const workerPort = workerPorts[roundRobinIndex++ % CPUsLength];
        
        const proxy = http.request(
            {
              hostname: "localhost",
              port: workerPort,
              path: req.url,
              method: req.method,
              headers: req.headers,
            },
            (proxyRes) => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res, { end: true });
            },
          );
        
          req.pipe(proxy, { end: true });
    });

    proxyServer.listen(port, () => {
        console.log(`Balancer is running on port ${port}`);
    });
} else {
    const port = +process.env.WORKER_PORT;
    if (port) {
      http.createServer(routes).listen(port, () => {
        console.log(`Worker ${process.pid} started on port ${port}`);
      });
    }
  
    process.on("message", (msg) => {
      const { type } = msg as { type: string };
      if (type === "updateUsers") {
        const { data } = msg as { data: IUser[] };

        users.splice(0, users.length, ...data);
      }
    });
}