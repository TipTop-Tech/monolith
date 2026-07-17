import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { SkinGallery } from "./SkinGallery";

export const AppearancePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-full w-full flex-col p-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="label-font text-sm">Settings</span>
      </button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick a skin for the whole app.</p>
      </div>

      <SkinGallery />
    </div>
  );
};
