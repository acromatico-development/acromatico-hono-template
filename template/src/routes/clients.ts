import { Hono } from "hono";

const clients = new Hono();

clients.get("/", (c) => {
  return c.text("Hello Acromatico Clients!");
});

export { clients };