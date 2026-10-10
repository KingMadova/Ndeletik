import "./profile.css";
import Link from "next/link";
import { planAtLeast, type Plan } from "@/lib/plans";
import { safeImageUrl, safeUrl } from "@/lib/safe-url";
import { resolveCustomTokens, resolveTheme } from "@/lib/themes/registry";
import { googleFontsHref, themeCssVars } from "@/lib/themes/tokens";
import type { Block, CustomTokens, LinkItem, Profile, Theme } from "@/lib/themes/types";
import { BadgeCheck, ChevronDown, ChevronRight, LinkIcon, SocialIcon } from "./icons";

type Props = {
  profile: Profile;
  /** Plan ACTIF du propriétaire (voir effectivePlan). */
  plan: Plan;
  /** Aperçu d'un thème précis, même verrouillé (sélecteur de thèmes). */
  themeOverride?: Theme;
  /** Couleurs personnalisées à prévisualiser (avec themeOverride). */
  customOverride?: CustomTokens;
  /** Aperçu : liens neutralisés, pas de formulaire actif. */
  preview?: boolean;
  /** Base du lien de suivi des clics : /go/[id]. */
  trackBase?: string;
};

function LinkView({ link, layout, href }: { link: LinkItem; layout: Theme["layout"]; href: string }) {
  const featured = link.featured ? "true" : undefined;

  if (layout === "banners") {
    const img = safeImageUrl(link.image);
    return (
      <a href={href} className="nd-banner" data-featured={featured}>
        <span
          className="nd-banner-media"
          style={img ? { backgroundImage: `url("${img}")` } : undefined}
        >
          {!img && <LinkIcon name={link.icon} size={34} />}
        </span>
        <span className="nd-banner-body">
          <span className="nd-t">{link.title}</span>
          {link.subtitle && <span className="nd-s">{link.subtitle}</span>}
          <span className="nd-cta">{link.cta ?? "Clique ici"}</span>
        </span>
      </a>
    );
  }

  if (layout === "grid") {
    return (
      <a href={href} className="nd-link" data-featured={featured}>
        <span className="nd-ic"><LinkIcon name={link.icon} size={26} /></span>
        <span className="nd-t">{link.title}</span>
      </a>
    );
  }

  if (layout === "cards") {
    return (
      <a href={href} className="nd-link" data-featured={featured}>
        <span className="nd-ic"><LinkIcon name={link.icon} /></span>
        <span className="nd-text">
          <span className="nd-t">{link.title}</span>
          {link.subtitle && <span className="nd-s">{link.subtitle}</span>}
        </span>
        <ChevronRight size={18} className="nd-chev" aria-hidden />
      </a>
    );
  }

  // pills
  return (
    <a href={href} className="nd-link" data-featured={featured}>
      {link.icon && <span className="nd-ic"><LinkIcon name={link.icon} size={16} /></span>}
      <span className="nd-t">{link.title}</span>
    </a>
  );
}

function BlockView({ block, slug, preview }: { block: Block; slug: string; preview: boolean }) {
  switch (block.type) {
    case "about":
      return (
        <section className="nd-card">
          <h2 className="nd-h2">{block.title}</h2>
          <p className="nd-p">{block.text}</p>
        </section>
      );
    case "stats":
      return (
        <section className="nd-card nd-stats">
          {block.items.map((s) => (
            <div key={s.label}>
              <div className="nd-stat-v">{s.value}</div>
              <div className="nd-stat-l">{s.label}</div>
            </div>
          ))}
        </section>
      );
    case "faq":
      return (
        <section className="nd-card">
          {block.items.map((f) => (
            <details key={f.q} className="nd-faq">
              <summary>
                {f.q} <ChevronDown size={16} aria-hidden />
              </summary>
              <p className="nd-p">{f.a}</p>
            </details>
          ))}
        </section>
      );
    case "newsletter":
      return (
        <section className="nd-card nd-news">
          <h2 className="nd-h2">{block.title}</h2>
          {block.subtitle && <p className="nd-p">{block.subtitle}</p>}
          <form action={preview ? undefined : "/api/newsletter"} method="post" className="nd-form">
            <input type="hidden" name="slug" value={slug} />
            <input type="email" name="email" required placeholder="Ton adresse e-mail" aria-label="Adresse e-mail" />
            <button type="submit" disabled={preview}>S'abonner</button>
          </form>
        </section>
      );
  }
}

export function ProfileRenderer({
  profile,
  plan,
  themeOverride,
  customOverride,
  preview = false,
  trackBase = "/go",
}: Props) {
  const theme = themeOverride ?? resolveTheme(profile.themeId, plan).theme;
  const custom = themeOverride ? customOverride : resolveCustomTokens(profile.customTokens, plan);
  const fontsHref = googleFontsHref(theme);
  const links = profile.links.filter((l) => l.enabled !== false);
  const href = (l: LinkItem) => (preview ? "#" : trackBase ? `${trackBase}/${l.id}` : safeUrl(l.url) ?? "#");

  // Le plan gratuit affiche toujours le badge ; Pro et Business peuvent le retirer.
  const showBadge = !planAtLeast(plan, "pro") || profile.showBadge !== false;
  const avatar = safeImageUrl(profile.avatarUrl);
  const cover = safeImageUrl(profile.coverUrl);
  const initial = profile.displayName.trim().charAt(0).toUpperCase() || "N";

  return (
    <div
      className="nd-profile"
      style={{ ...themeCssVars(theme, custom), colorScheme: theme.dark ? "dark" : "light" }}
      data-layout={theme.layout}
      data-btn={theme.buttonStyle}
      data-header={theme.header}
      data-avatar={theme.avatarShape}
      data-upper-links={theme.uppercaseLinks ? "true" : undefined}
      data-upper-name={theme.uppercaseName ? "true" : undefined}
    >
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}
      <main className="nd-col">
        <header className="nd-header">
          {theme.header === "cover" && (
            <div
              className="nd-cover"
              style={cover ? { backgroundImage: `url("${cover}")` } : undefined}
              aria-hidden
            />
          )}
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={profile.displayName} className="nd-avatar" />
          ) : (
            <div className="nd-avatar nd-avatar-fallback" aria-hidden>{initial}</div>
          )}
          <h1 className="nd-name">
            {profile.displayName}
            {profile.verified && <BadgeCheck size={20} className="nd-verified" aria-label="Profil vérifié" />}
          </h1>
          {profile.headline && <p className="nd-headline">{profile.headline}</p>}
          {profile.bio && <p className="nd-bio">{profile.bio}</p>}
          {profile.socials.length > 0 && (
            <nav className="nd-socials" aria-label="Réseaux sociaux">
              {profile.socials.map((s) => (
                <a
                  key={s.type}
                  href={preview ? "#" : safeUrl(s.url) ?? "#"}
                  aria-label={s.type}
                  rel="noopener noreferrer"
                >
                  <SocialIcon type={s.type} />
                </a>
              ))}
            </nav>
          )}
        </header>

        <nav className="nd-links" aria-label="Liens">
          {links.map((l) => (
            <LinkView key={l.id} link={l} layout={theme.layout} href={href(l)} />
          ))}
        </nav>

        {profile.blocks?.map((b, i) => (
          <BlockView key={i} block={b} slug={profile.slug} preview={preview} />
        ))}

        {showBadge && (
          <footer className="nd-foot">
            <Link href="/">Créé avec Ndeletik</Link>
          </footer>
        )}
      </main>
    </div>
  );
}