import { useState } from "react";
import { useNavigate } from "react-router";
import { haptics } from "../../lib/haptics";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { ArrowLeft } from "lucide-react";

export const SettingsPage = () => {
  const navigate = useNavigate();

  const [hapticsOn, setHapticsOn] = useState(() => {
    try {
      return localStorage.getItem("hapticsEnabled") !== "false";
    } catch {
      return true;
    }
  });

  const toggleHaptics = (next: boolean) => {
    try {
      localStorage.setItem("hapticsEnabled", next ? "true" : "false");
    } catch {
    }
    setHapticsOn(next);
    if (next) haptics.tap();
  };

  return (
    <div className="flex h-full w-full flex-col p-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="label-font text-sm">Back</span>
      </button>

      <h1 className="text-3xl font-bold tracking-tight mb-4">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium leading-none">Haptics</p>
              <p className="text-sm text-muted-foreground mt-1">Haptic feedback</p>
            </div>
            <Switch checked={hapticsOn} onCheckedChange={toggleHaptics} aria-label="Haptics" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
