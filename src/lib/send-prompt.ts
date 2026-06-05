import { toast } from "sonner";

/**
 * Bridge to Claude skills. In a hosted environment this would dispatch to the
 * Claude runtime; here we surface the prompt + skill that would be invoked so
 * the UI behaves predictably and the contract is visible.
 */
export async function sendPrompt(opts: {
  skill: string;
  prompt: string;
  artifact?: string;
}) {
  // eslint-disable-next-line no-console
  console.log("[sendPrompt]", opts);
  toast.success(`Dispatched to ${opts.skill}`, {
    description: opts.artifact ? `Generating: ${opts.artifact}` : opts.prompt.slice(0, 120),
  });
  return { ok: true as const };
}
