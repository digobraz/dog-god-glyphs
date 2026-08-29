import { Link, useLocation } from "react-router-dom";
import { List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type RouteGroup = { label: string; routes: { path: string; name: string }[] };

const GROUPS: RouteGroup[] = [
  {
    label: "Landing / Public",
    routes: [
      { path: "/", name: "Spiral landing (/)" },
      { path: "/spiral", name: "Spiral (alias)" },
      { path: "/grid", name: "Wall" },
      { path: "/vision", name: "Vision" },
      { path: "/religion", name: "Religion" },
      { path: "/about", name: "About" },
      { path: "/terms", name: "Terms" },
      { path: "/privacy", name: "Privacy" },
    ],
  },
  {
    // ⚠️ PORADIE KROKOV MÁ KÁNON V `components/lab/HeroflowDevMenu.tsx` — tento
    // zoznam sa od neho 28. 8. 2026 rozišiel (chýbal e-mail aj `why`, fotka bola
    // dvakrát a poradie bolo predlaunchové). Keď sa vstup zmení, meň OBA.
    label: "Heroglyph wizard",
    routes: [
      { path: "/heroglyph/photo", name: "1. Fotka" },
      { path: "/heroglyph/name", name: "2. Meno" },
      { path: "/heroglyph/email", name: "3. E-mail" },
      { path: "/heroglyph/why", name: "4. Prečo heroglyf" },
      { path: "/heroglyph/about", name: "5. Papierovačky" },
      { path: "/heroglyph/breed", name: "6. Breed / Patron" },
      { path: "/heroglyph/ranking", name: "7. Ranking" },
      { path: "/heroglyph/owner-info", name: "8. Owner info" },
      { path: "/heroglyph/owner-zodiac", name: "9. Owner zodiac" },
      { path: "/heroglyph/owner-final", name: "10. Owner final" },
      { path: "/heroglyph/dog-gender", name: "11. Dog gender" },
      { path: "/heroglyph/dog-fate", name: "12. Dog fate" },
      { path: "/heroglyph/dog-colour", name: "13. Dog colour" },
      { path: "/heroglyph/dog-bloodline", name: "14. Dog bloodline" },
      { path: "/heroglyph/dog-character", name: "15. Dog character" },
      { path: "/heroglyph/crop", name: "16. Výrez" },
      { path: "/heroglyph/reveal", name: "17. Reveal" },
      { path: "/heroglyph/message", name: "18. Message" },
    ],
  },
  {
    label: "Checkout",
    routes: [
      { path: "/checkout", name: "Checkout" },
      { path: "/payment", name: "Payment" },
      { path: "/welcome", name: "Welcome" },
    ],
  },
  {
    label: "Pack (auth)",
    routes: [
      { path: "/login", name: "Login" },
      { path: "/pack", name: "Pack" },
      { path: "/pack/profile", name: "Pack profile" },
    ],
  },
];

export function DevNav() {
  const { pathname } = useLocation();

  // Never on headless render targets — would bleed into the generated PDF / share card PNG.
  if (pathname.startsWith("/cert-render") || pathname.startsWith("/share-render")) return null;
  // ONEPAGE sa ladí ako HOTOVÝ web, aj na telefóne cez tunel (Matej 27. 8. 2026:
  // „odstráň pomocné dev menu aj TEXT1/2“). Vývojárske ovládanie v rohu tam kazí
  // dojem z návrhu a na mobile prekrýva spodnú lištu. Na ostatných dev cestách
  // menu zostáva — je to jediný spôsob, ako sa medzi nimi preklikať.
  if (pathname.startsWith("/onepage")) return null;

  // Hide on production custom domain (dogypt.com). Show in dev + lovable.app preview/published.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isDev = import.meta.env.DEV;
    const isLovable = host.endsWith("lovable.app") || host === "localhost" || host === "127.0.0.1";
    if (!isDev && !isLovable) return null;
  }

  return (
    <div className="fixed bottom-3 right-3 z-[9999]">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-mono text-white shadow-lg backdrop-blur hover:bg-black/85 focus:outline-none"
          aria-label="Dev navigation"
        >
          <List className="h-3.5 w-3.5" />
          Dev nav
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          className="max-h-[70vh] w-72 overflow-y-auto"
        >
          {GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.routes.map((r) => (
                <DropdownMenuItem key={r.path} asChild>
                  <Link
                    to={r.path}
                    className={cn(
                      "flex items-center justify-between gap-2 text-sm",
                      pathname === r.path && "bg-accent font-semibold",
                    )}
                  >
                    <span className="truncate">{r.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {r.path}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}