import mongoose from "mongoose";

export function getHealth(_request, response) {
  response.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
}
