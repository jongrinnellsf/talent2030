import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createApp } = require("../dist/server.cjs") as {
  createApp: (options?: {
    listen?: boolean;
    webSocket?: boolean;
    useVite?: boolean;
  }) => Promise<{ app: import("express").Express }>;
};

const { app } = await createApp({
  listen: false,
  webSocket: false,
  useVite: false,
});

export default app;
