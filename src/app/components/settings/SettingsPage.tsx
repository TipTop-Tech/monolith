import { useState } from "react";
import { useNavigate } from "react-router";
import { haptics } from "../../lib/haptics";
import { SkinGallery } from "./SkinGallery";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { ArrowLeft } from "lucide-react";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium leading-none">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

const read = (key: string, defaultOn: boolean) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? defaultOn : v === "true";
  } catch {
    return defaultOn;
  }
};

const write = (key: string, next: boolean) => {
  try {
    localStorage.setItem(key, next ? "true" : "false");
  } catch {
  }
  window.dispatchEvent(new Event("prefschange"));
};

export const SettingsPage = () => {
  const navigate = useNavigate();

  const [hapticsOn, setHapticsOn] = useState(() => read("hapticsEnabled", true));
  const [soundOn, setSoundOn] = useState(() => read("soundEnabled", true));
  const [reduceMotion, setReduceMotion] = useState(() => read("reduceMotion", false));

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
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <SkinGallery />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ToggleRow
            label="Haptics"
            description="Haptic feedback"
            checked={hapticsOn}
            onChange={(next) => {
              write("hapticsEnabled", next);
              setHapticsOn(next);
              if (next) haptics.tap();
            }}
          />
          <ToggleRow
            label="Sound"
            description="Sound effects"
            checked={soundOn}
            onChange={(next) => {
              write("soundEnabled", next);
              setSoundOn(next);
            }}
          />
          <ToggleRow
            label="Reduce motion"
            description="Minimize animations"
            checked={reduceMotion}
            onChange={(next) => {
              write("reduceMotion", next);
              setReduceMotion(next);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
