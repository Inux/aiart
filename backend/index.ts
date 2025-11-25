let messageCount = 0;

const server = Bun.serve({
  port: 3001,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 500 });
      }
      return undefined;
    }

    return new Response("Pixel Canvas Backend", { status: 200 });
  },
  websocket: {
    open(ws) {
      console.log("Client connected");
      messageCount = 0;
    },
    message(ws, message) {
      try {
        const data = JSON.parse(message as string);

        if (data.type === "getPixelColor") {
          const { x, y } = data;

          // Generate random color
          const r = Math.floor(Math.random() * 256);
          const g = Math.floor(Math.random() * 256);
          const b = Math.floor(Math.random() * 256);

          ws.send(JSON.stringify({
            type: "pixelColor",
            x,
            y,
            color: { r, g, b }
          }));

          messageCount++;
          if (messageCount % 1000 === 0) {
            console.log(`Processed ${messageCount} pixel color requests`);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
    close(ws) {
      console.log(`Client disconnected. Processed ${messageCount} total messages`);
    },
  },
});

console.log(`WebSocket server running on ws://localhost:${server.port}/ws`);
