// Régénère le seed SQL de themes_catalog depuis lib/themes/*.ts
// Usage : npx tsx scripts/gen-themes-seed.ts → copier le résultat dans une nouvelle migration.
import { ALL_THEMES } from "../lib/themes/registry";

const rows = ALL_THEMES.map((t) => `('${t.id}', '${t.plan}')`).join(",\n");
console.log(
  `insert into public.themes_catalog (id, plan) values\n${rows}\non conflict (id) do update set plan = excluded.plan;`
);