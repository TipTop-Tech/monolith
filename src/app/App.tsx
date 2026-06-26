import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  return (
    <AuthProvider>

      <RouterProvider router={router} />
      <Analytics />
    </AuthProvider>
  );
}