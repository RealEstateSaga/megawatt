import type { NarrativeState } from "../context/SiteContext";

/**
 * State Machine definitions — scroll thresholds and phase metadata.
 *
 * These control when SiteContext transitions between narrative states.
 * Thresholds are normalized scroll progress values (0–1).
 */
export interface StateDefinition {
  id: NarrativeState;
  /** Entry threshold — narrative state activates when scroll depth exceeds this */
  threshold: number;
  /** Display label shown in narrative progress indicator */
  label: string;
  /** Background motion intensity — lower = more static */
  motionLevel: "high" | "medium" | "low" | "minimal";
}

export const STATE_DEFINITIONS: StateDefinition[] = [
  {
    id: "intro",
    threshold: 0,
    label: "Orientation",
    motionLevel: "high",
  },
  {
    id: "framing",
    threshold: 0.1,
    label: "Reframing",
    motionLevel: "medium",
  },
  {
    id: "mechanism",
    threshold: 0.3,
    label: "Mechanism",
    motionLevel: "medium",
  },
  {
    id: "validation",
    threshold: 0.58,
    label: "Validation",
    motionLevel: "minimal",
  },
  {
    id: "conversion",
    threshold: 0.82,
    label: "Conversion",
    motionLevel: "low",
  },
];

/** Derive narrative state from scroll progress using thresholds */
export function resolveNarrativeState(progress: number): NarrativeState {
  // Walk backwards to find the highest threshold the progress exceeds
  for (let i = STATE_DEFINITIONS.length - 1; i >= 0; i--) {
    if (progress >= STATE_DEFINITIONS[i].threshold) {
      return STATE_DEFINITIONS[i].id;
    }
  }
  return "intro";
}
