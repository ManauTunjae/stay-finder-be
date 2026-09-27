import { Hono } from "hono";
import fs from "fs/promises";

const bookings = new Hono({ strict: false });

export default bookings;
