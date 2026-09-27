import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import properties from './routes/properties.js'
import bookings from './routes/bookings.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/properties", properties);
app.route("/bookings", bookings);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
