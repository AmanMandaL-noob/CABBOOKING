import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { connectDatabase } from "./config/db";
import { corsOriginDelegate, env } from "./config/env";
import { configureSockets } from "./modules/sockets";

async function bootstrap() {
  await connectDatabase();

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: corsOriginDelegate, credentials: true },
    transports: ["websocket", "polling"]
  });

  configureSockets(io);

  httpServer.listen(env.PORT, () => {
    console.log(`API and Socket.IO server running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
