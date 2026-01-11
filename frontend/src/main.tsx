import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { AuthProvider } from "./app/providers/AuthProvider";
import AppQueryClientProvider from "./app/providers/QueryClientProvider";
import "./index.css"; // Ensure global styles are applied
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppQueryClientProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AppQueryClientProvider>
  </React.StrictMode>
);
