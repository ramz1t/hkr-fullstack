import type { SlotsBetDto } from "@repo/types";
import { SlotOutcome } from "@repo/types";

export const formatSlotsOutcome = (
  bet: SlotsBetDto
): { label: string; won: boolean } => ({
  label: bet.slots.outcome,
  won: bet.slots.outcome !== SlotOutcome.LOSS
});
