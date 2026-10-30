
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

// Firebase App Check
import { setupAppCheck } from "./lib/appCheck";

// Estilos
import "./index.css";
import "./App.css";
import "./styles/animations.css";

// Inicializar App Check antes de montar React
setupAppCheck();

// Iniciar BRONXWALLET
ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
