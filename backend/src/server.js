import express from "express";
import  path from "path";
import cors from "cors";
import { serve } from "inngest/express";


import { ENV } from "./lib/env.js";      // <- correct relative import
import { connectDB } from "./lib/db.js";
import {inngest,functions} from "./lib/inngest.js" ;
import { clerkMiddleware } from "@clerk/express";

import chatRoutes from "./routes/chatRoutes.js";
import sessionsRoutes from "./routes/sessionRoute.js";


const app = express();

// ✅ Proper __dirname in ES modules
const __dirname = path.resolve();
app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL, credentials:true}));
app.use(clerkMiddleware());
app.use("/api/inngest",serve({client:inngest,functions}));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionsRoutes);

app.get("/", (req, res) => {
	res.status(200).json({
		message: "Backend API is running. Please use the frontend application to access the UI.",
	});
});

app.get("/health", (req, res) => {
  
  res.status(200).json({ msg: "api is upp and running" });
});



if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // ✅ use "/*" or "*" instead of "/{*any}"
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ✅ Start server only after DB is connected
const startServer = async () => {
  try {
    await connectDB(); 
    app.listen(ENV.PORT, () => console.log("Server is running on port ", ENV.PORT));
  } catch (error) {
    console.error("Error starting server: ", error);
  }
};
startServer(); 