import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { preloadStartupSound } from "../utils/audio";
import { StartOverlay } from "./components/StartOverlay";

export default function App() {
  useEffect(() => {
    preloadStartupSound();
  }, []);

  return (
    <AuthProvider>
      <StartOverlay>
        <RouterProvider router={router} />
      </StartOverlay>
      <Analytics debug={false} />
    </AuthProvider>
  );
}