import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedDatabase } from "./lib/seed";

// Initialize database with seed data
seedDatabase().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
