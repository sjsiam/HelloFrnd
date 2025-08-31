import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";
import { createClient } from "@redis/client";
import { getUserInfo } from "../lib/oauth2.ts";

interface WebSocketWithUser extends WebSocket {
  userId?: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });
  const redis = createClient({ url: process.env.REDIS_URL });
  redis.connect().catch(console.error);

  wss.on("connection", async (ws: WebSocketWithUser, req) => {
    // Extract auth_token from query params
    const url = new URL(req.url || "", "http://localhost");
    const authToken = url.searchParams.get("auth_token");

    if (!authToken) {
      ws.close(1008, "Missing auth_token");
      return;
    }

    try {
      const userInfo = await getUserInfo(authToken);
      ws.userId = userInfo.id.toString();
      console.log(`WebSocket connected for user: ${ws.userId}`);

      // Subscribe to user's channel
      await redis.subscribe(`user:${ws.userId}`, (message) => {
        ws.send(message);
      });

      ws.on("message", async (data) => {
        try {
          const { type, payload } = JSON.parse(data.toString());
          if (type === "message") {
            const { conversationId, content } = payload;
            // Store message in DB (implemented later)
            const message = {
              conversationId,
              senderId: ws.userId,
              content,
              timestamp: new Date().toISOString(),
            };
            // Publish to recipient(s)
            await redis.publish(
              `conversation:${conversationId}`,
              JSON.stringify(message)
            );
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      });

      ws.on("close", () => {
        console.log(`WebSocket disconnected for user: ${ws.userId}`);
        redis.unsubscribe(`user:${ws.userId}`);
      });
    } catch (error) {
      console.error("WebSocket auth error:", error);
      ws.close(1008, "Invalid auth_token");
    }
  });
}
