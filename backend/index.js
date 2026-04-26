import "dotenv/config";
import { connectDB, disconnectDB } from "./src/config/db.js";
import app from "./src/app.js";

const port = process.env.PORT || 5000;

async function startServer() {
	try {
		await connectDB(process.env.MONGO_URI);

		const server = app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});

		const shutdown = async (signal) => {
			console.log(`Received ${signal}. Shutting down gracefully...`);
			server.close(async () => {
				await disconnectDB();
				process.exit(0);
			});
		};

		process.on("SIGINT", () => shutdown("SIGINT"));
		process.on("SIGTERM", () => shutdown("SIGTERM"));
	} catch (error) {
		console.error("Failed to start server:", error.message);
		process.exit(1);
	}
}

startServer();
