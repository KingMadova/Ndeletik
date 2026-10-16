import type { DbProfile } from "@/lib/dashboard-types";

/** Avatar rond avec repli sur l'initiale, aux couleurs de la marque. */
export function ProfileAvatar({
  profile,
  size = 40,
}: {
  profile: Pick<DbProfile, "display_name" | "slug" | "avatar_url">;
  size?: number;
}) {
  const name = profile.display_name || profile.slug;
  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-soft object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-fractal-or to-fractal-terra font-display font-extrabold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.4) }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
