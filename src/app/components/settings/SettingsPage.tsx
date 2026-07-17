import { useState } from "react";
import { useNavigate } from "react-router";
import { Capacitor } from "@capacitor/core";
import { ArrowLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { haptics } from "../../lib/haptics";
import { useWorkout } from "../../context/WorkoutContext";
import { useTheme } from "../../hooks/useTheme";
import { SKINS } from "../../lib/skins";
import { getDefaultRestTime, setDefaultRestTime } from "../../lib/prefs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";

const APP_VERSION = "0.0.1";
const LINKS = {
  terms: "https://monolith.app/terms",
  privacy: "https://monolith.app/privacy",
  rate: "https://apps.apple.com/app/monolith",
  support: "mailto:support@monolith.app",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const readBool = (key: string, defaultOn: boolean) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? defaultOn : v === "true";
  } catch {
    return defaultOn;
  }
};

const writeBool = (key: string, next: boolean) => {
  try {
    localStorage.setItem(key, next ? "true" : "false");
  } catch {
    void 0;
  }
  window.dispatchEvent(new Event("prefschange"));
};

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

function NavRow({
  label,
  value,
  swatch,
  onClick,
}: {
  label: string;
  value?: string;
  swatch?: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 py-2 text-left">
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2 text-muted-foreground">
        {swatch && (
          <span
            className="h-5 w-5 rounded-full border border-foreground/15"
            style={{ background: swatch }}
          />
        )}
        {value && <span className="text-sm">{value}</span>}
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

function SegRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium">{label}</span>
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            data-active={value === o}
            className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-colors"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepperRow({
  label,
  display,
  onDec,
  onInc,
}: {
  label: string;
  display: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Decrease"
        >
          <Minus size={16} />
        </button>
        <span className="display-font text-lg tabular-nums w-12 text-center">{display}</span>
        <button
          onClick={onInc}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Increase"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { weightUnit, setWeightUnit } = useWorkout();
  const { pref } = useTheme();

  const [hapticsOn, setHapticsOn] = useState(() => readBool("hapticsEnabled", true));
  const [soundOn, setSoundOn] = useState(() => readBool("soundEnabled", true));
  const [reduceMotion, setReduceMotion] = useState(() => readBool("reduceMotion", false));
  const [liveActivity, setLiveActivity] = useState(() => readBool("liveActivitiesEnabled", true));
  const [rest, setRest] = useState(() => getDefaultRestTime());

  const isIOS = Capacitor.getPlatform() === "ios";

  const currentSkin = SKINS.find((s) => s.id === pref);
  const skinLabel = pref === "auto" ? "Auto" : currentSkin?.name ?? "Auto";
  const skinSwatch =
    pref === "auto"
      ? "linear-gradient(135deg,#ece9e4 0 50%,#0f0f0f 50%)"
      : currentSkin?.swatch.bg;

  const changeRest = (delta: number) => {
    const next = Math.max(15, Math.min(600, rest + delta));
    setRest(next);
    setDefaultRestTime(next);
    haptics.tap();
  };

  const openLink = (url: string) => {
    haptics.tap();
    window.open(url, "_blank");
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

      <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <NavRow
            label="Theme"
            value={skinLabel}
            swatch={skinSwatch}
            onClick={() => {
              haptics.tap();
              navigate("/settings/appearance");
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SegRow
            label="Weight units"
            options={["LB", "KG"]}
            value={weightUnit}
            onChange={(v) => {
              setWeightUnit(v);
              haptics.tap();
            }}
          />
          <StepperRow
            label="Default rest"
            display={formatTime(rest)}
            onDec={() => changeRest(-15)}
            onInc={() => changeRest(15)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sound &amp; Haptics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ToggleRow
            label="Haptics"
            description="Haptic feedback"
            checked={hapticsOn}
            onChange={(next) => {
              writeBool("hapticsEnabled", next);
              setHapticsOn(next);
              if (next) haptics.tap();
            }}
          />
          <ToggleRow
            label="Sound"
            description="Sound effects"
            checked={soundOn}
            onChange={(next) => {
              writeBool("soundEnabled", next);
              setSoundOn(next);
            }}
          />
        </CardContent>
      </Card>

      {isIOS && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleRow
              label="Live Activities"
              description="Show your workout on the Lock Screen & Dynamic Island"
              checked={liveActivity}
              onChange={(next) => {
                writeBool("liveActivitiesEnabled", next);
                setLiveActivity(next);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleRow
            label="Reduce motion"
            description="Minimize animations"
            checked={reduceMotion}
            onChange={(next) => {
              writeBool("reduceMotion", next);
              setReduceMotion(next);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-foreground/10">
            <InfoRow label="Version" value={APP_VERSION} />
            <NavRow label="Terms of Service" onClick={() => openLink(LINKS.terms)} />
            <NavRow label="Privacy Policy" onClick={() => openLink(LINKS.privacy)} />
            <NavRow label="Rate the App" onClick={() => openLink(LINKS.rate)} />
            <NavRow label="Contact Support" onClick={() => openLink(LINKS.support)} />
          </div>
          <p className="text-sm text-muted-foreground user-text mt-3">
            Exercise demo videos are AI-generated — made with Google Gemini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
