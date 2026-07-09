import { Check, Lock } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { usePremium } from "../../context/PremiumContext";
import { SKINS, Skin } from "../../lib/skins";
import { haptics } from "../../lib/haptics";

function Card({
  name,
  selected,
  locked,
  onClick,
  children,
}: {
  name: string;
  selected: boolean;
  locked?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-active={selected}
      className="relative rounded-xl p-2 text-left bg-secondary/40 ring-2 ring-transparent transition-all data-[active=true]:ring-primary"
    >
      {children}
      <div className="mt-2 flex items-center justify-between px-1">
        <span className="label-font text-xs text-foreground">{name}</span>
        {locked ? (
          <Lock size={13} className="text-muted-foreground" />
        ) : selected ? (
          <Check size={14} className="text-primary" />
        ) : null}
      </div>
    </button>
  );
}

function Swatch({ bg, fg, accent }: Skin["swatch"]) {
  return (
    <div
      className="relative h-16 w-full overflow-hidden rounded-lg border border-foreground/10"
      style={{ background: bg }}
    >
      <div className="absolute left-2.5 top-3 h-2 w-11 rounded-full" style={{ background: fg }} />
      <div
        className="absolute left-2.5 top-6 h-1.5 w-7 rounded-full"
        style={{ background: fg, opacity: 0.45 }}
      />
      <div
        className="absolute bottom-2.5 right-2.5 h-5 w-5 rounded-full"
        style={{ background: accent }}
      />
    </div>
  );
}

export function SkinGallery() {
  const { pref, setPref } = useTheme();
  const { isPro, presentPaywall } = usePremium();

  const pick = (skin: Skin) => {
    if (skin.pro && !isPro) {
      presentPaywall();
      return;
    }
    haptics.tap();
    setPref(skin.id);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        name="Auto"
        selected={pref === "auto"}
        onClick={() => {
          haptics.tap();
          setPref("auto");
        }}
      >
        <div
          className="h-16 w-full overflow-hidden rounded-lg border border-foreground/10"
          style={{ background: "linear-gradient(135deg, #ece9e4 0 50%, #0f0f0f 50% 100%)" }}
        />
      </Card>
      {SKINS.map((skin) => (
        <Card
          key={skin.id}
          name={skin.name}
          selected={pref === skin.id}
          locked={!!skin.pro && !isPro}
          onClick={() => pick(skin)}
        >
          <Swatch {...skin.swatch} />
        </Card>
      ))}
    </div>
  );
}
