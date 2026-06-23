import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import { redis } from "./lib/redis.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", async (_, res) => {
    const pong = await redis.ping();

    res.json({
        status: "ok",
        redis: pong,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});