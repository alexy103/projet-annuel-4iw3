import { config } from "dotenv";
import { app } from "./app";

config({
  quiet: true,
});

const PORT: number = parseInt(process.env.API_PORT || "4005", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
