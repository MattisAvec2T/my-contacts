import express from 'express';
import authRoutes from "./routes/auth.route.js";
import verifyToken from "./middlewares/auth.middleware.js";
import contactRoutes from "./routes/contact.route.js";
import cors from "cors";
import { PORT } from "./config/env.config.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./config/swagger.config.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use("/auth", authRoutes());
app.use("/contact", verifyToken, contactRoutes())
app.use(errorMiddleware)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));