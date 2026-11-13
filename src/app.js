import express from "express";
// import { requestLogger } from "./middlewares/requestLogger.js";
import hivesRouter from "./route/hives.route.js";
import morgan from "morgan";


const app = express();

// app.use(requestLogger);
app.use(morgan('dev'));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/hives", hivesRouter);

export default app;
