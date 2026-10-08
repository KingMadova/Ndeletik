"use client";
import { Copy, Share2, Palette, Globe, Link2 } from "lucide-react";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  country: string | null;
  role?: string | null;
  views?: number | null;
  theme?: string | null;
  created_at?: string;
};

export function Banner({ url, className = "" }: { url: string | null; className?: string }) {
  if (url) {
    return (
      <div
        className={`w-full bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${url})` }}
        role="img"
        aria-label="Bannière du profil"
      />
    );
  }
  return <div className={`w-full bg-yekola-gradient ${className}`} />;
}

export function Avatar({ profile, size = 88 }: { profile: Profile; size?: number }) {
  const name = profile.display_name || profile.username;
  const initials = name.slice(0, 2).toUpperCase();

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover bg-surface"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-yekola-gradient text-white flex items-center justify-center font-bold select-none"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.6) }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

type ProfileCardProps = {
  profile: Profile;
  publicUrl: string;
  onCopy: () => void;
  onShare: () => void;
  onCustomize: () => void;
};

export function ProfileCard({ profile, publicUrl, onCopy, onShare, onCustomize }: ProfileCardProps) {
  const shortUrl = publicUrl.replace(/^https?:\/\//, "");

  return (
    <div className="relative z-10 px-4 sm:px-6">
      <div className="-mt-6 bg-surface rounded-2xl border border-line shadow-soft p-5 flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="-mt-12 shrink-0 rounded-full ring-4 ring-surface shadow-soft">
            <Avatar profile={profile} size={88} />
          </div>
          <div className="min-w-0 pt-8">
            {profile.country && (
              <span className="inline-flex items-center gap-1 rounded-full bg-soft text-muted text-[11px] px-2 py-0.5 mb-1 border border-line">
                <Globe size={11} /> {profile.country}
              </span>
            )}
            <h2 className="text-lg font-display font-bold text-ink truncate">
              {profile.display_name || profile.username}
            </h2>
            {profile.bio && (
              <p className="text-xs text-muted truncate">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="lg:w-[26rem] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-ink">Lien Ndeletik</span>
            <button
              onClick={onCustomize}
              className="text-xs text-fractal-terra hover:text-fractal-ocre inline-flex items-center gap-1 transition-colors"
            >
              <Palette size={12} /> Personnaliser →
            </button>
          </div>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-line bg-soft px-3 py-2">
              <Link2 size={14} className="text-muted shrink-0" />
              <span className="text-xs text-ink truncate">{shortUrl}</span>
              <button
                onClick={onCopy}
                aria-label="Copier le lien"
                className="ml-auto p-1 rounded hover:bg-surface text-muted transition-colors shrink-0"
              >
                <Copy size={13} />
              </button>
            </div>
            <button
              onClick={onShare}
              className="inline-flex items-center gap-1.5 rounded-lg bg-yekola-gradient hover:opacity-90 text-white text-xs font-semibold px-3.5 py-2.5 shrink-0 shadow-soft transition-all"
            >
              <Share2 size={13} /> Partager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}