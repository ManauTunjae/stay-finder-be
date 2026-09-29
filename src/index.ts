import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env.js";
import properties from "./routes/properties.js";
import bookings from "./routes/bookings.js";

const app = new Hono({
  strict: false,
});

app.get("/", (c) => {
  return c.text("stay-finder API");
});

app.route("/properties", properties);
app.route("/bookings", bookings);

serve(
  {
    fetch: app.fetch,
    port: env.honoPort,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
