import "dotenv/config";
import express from "express";
import cors from "cors";
import gatewayRoutes from "./routes/gatewayRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", gatewayRoutes);

app.get("/health", (req, res) => res.json({ status: "API Gateway running" }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));