import cors from 'cors'
import { config } from './env'

export const corsOptions: cors.CorsOptions = {
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}