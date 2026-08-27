import { Building2, Car, Droplets, ParkingCircle, ShieldCheck, Snowflake, Sofa, Trees, Waves, Wifi, Zap } from "lucide-react";

const AMENITIES = {
  POOL: { label: "Piscine", Icon: Waves },
  AIR_CONDITIONING: { label: "Climatisation", Icon: Snowflake },
  GARAGE: { label: "Garage", Icon: Car },
  GARDEN: { label: "Jardin", Icon: Trees },
  BALCONY: { label: "Balcon", Icon: Building2 },
  ELEVATOR: { label: "Ascenseur", Icon: Building2 },
  SECURITY: { label: "Sécurité", Icon: ShieldCheck },
  WIFI: { label: "WiFi", Icon: Wifi },
  FURNISHED: { label: "Meublé", Icon: Sofa },
  RUNNING_WATER: { label: "Eau courante", Icon: Droplets },
  GENERATOR: { label: "Électricité / groupe", Icon: Zap },
  PARKING: { label: "Parking", Icon: ParkingCircle },
} as const;

export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  const items = amenities
    .map((code) => AMENITIES[code as keyof typeof AMENITIES])
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <section className="mt-8 rounded-[2rem] bg-white p-7 shadow-soft">
      <h2 className="text-2xl font-extrabold">Équipements</h2>
      <p className="mt-2 text-sm text-ink/55">Les équipements déclarés comme disponibles dans ce bien.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-sand/60 px-4 py-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-forest shadow-sm"><Icon size={20}/></span>
            <span className="font-bold text-ink/80">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
