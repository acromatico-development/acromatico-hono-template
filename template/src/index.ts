import 'dotenv/config';
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { logger } from 'hono/logger'
import { clients } from './routes/clients';

const app = new Hono();

app.use(logger());

app.get("/", (c) => {
  const { PORT } = env<{ PORT: string }>(c);

  return c.text(`Hello Acromatico API! ${PORT}`);
});

app.route("/clients", clients);

const port = Number(process.env.PORT) || 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
