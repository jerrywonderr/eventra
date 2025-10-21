import express from "express";
import dotenv from "dotenv";
import eventRoutes from "../routes/eventRoutes";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
