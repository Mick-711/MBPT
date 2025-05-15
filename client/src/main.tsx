import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProviderComponent } from "@/components/auth/auth-provider";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="fitcoach-theme">
      <AuthProviderComponent>
        <App />
      </AuthProviderComponent>
    </ThemeProvider>
  </QueryClientProvider>
);
