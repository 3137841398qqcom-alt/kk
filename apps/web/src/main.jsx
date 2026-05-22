import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "./context/AudioContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AudioProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </AudioProvider>
  </StrictMode>,
);
