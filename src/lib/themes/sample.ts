import type { Profile } from "./types";

export const SAMPLE_PROFILE: Profile = {
  slug: "demo",
  displayName: "Démo Ndeletik",
  bio: "Ceci est une page de démonstration",
  verified: false,
  showBadge: true,
  themeId: "minimal",
  customTokens: {},
  socials: [],
  links: [
    {
      id: "1",
      title: "Lien exemple",
      url: "https://example.com",
      enabled: true,
      position: 0,
      clicks: 0,
    },
  ],
  blocks: [],
};