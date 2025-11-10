// pages/api/socket.ts - Socket.IO API Route
import { NextApiRequest } from "next";
import { NextApiResponseServerIO, initSocketIO } from "@/lib/socket";

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log("⚡ Setting up Socket.IO...");
    const io = initSocketIO(res.socket.server);
    res.socket.server.io = io;
  } else {
    console.log("✅ Socket.IO already running");
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
