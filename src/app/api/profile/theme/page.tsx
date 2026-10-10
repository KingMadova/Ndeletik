import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { ALL_THEMES } from "@/lib/themes/registry";
import { SAMPLE_PROFILE } from "@/lib/themes/sample";
import type { Plan } from "@/lib/plans";

type SP = Record<string, string | undefined>;

// /preview?theme=<id>&plan=free|pro|business (plan = simulation du verrouillage)
export default async function PreviewPage({ searchParams }: { searchParams: Promise<SP> | SP }) {
  const sp = await searchParams;
  const plan = (["free", "pro", "business"].includes(sp.plan ?? "") ? sp.plan : "business") as Plan;
  const themeId = sp.theme ?? ALL_THEMES[0]?.id ?? "fallback";
  return <ProfileRenderer profile={{ ...SAMPLE_PROFILE, themeId }} plan={plan} preview />;
}