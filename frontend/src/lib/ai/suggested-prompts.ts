/**
 * Centralized Registry of Contextual AI Suggested Prompts.
 * Maps context types to curated questions according to page context.
 */

import { AIContextType } from "./ai-context";

export interface ContextualPrompt {
  id: string;
  label: string;
  prompt: string;
  category?: string;
}

export const CONTEXTUAL_PROMPTS: Record<string, ContextualPrompt[]> = {
  [AIContextType.PROJECT]: [
    { id: "p1", label: "What makes Amnaya different?", prompt: "What makes Amnaya different from other luxury developments?" },
    { id: "p2", label: "Show me the residences", prompt: "Show me available residences at Amnaya." },
    { id: "p3", label: "What amenities are available?", prompt: "What amenities are available at Amnaya?" },
    { id: "p4", label: "Which residence suits me?", prompt: "Help me choose which residence suits my lifestyle and preferences." },
  ],
  [AIContextType.RESIDENCE]: [
    { id: "r1", label: "What is special about this residence?", prompt: "What is special about this residence?" },
    { id: "r2", label: "What views does it have?", prompt: "What views does this residence offer?" },
    { id: "r3", label: "Show floor plan options", prompt: "What are the floor plan options for this residence?" },
    { id: "r4", label: "Which units are available?", prompt: "Which units are currently available in this residence?" },
    { id: "r5", label: "Compare with another residence", prompt: "Compare this residence with other available typologies." },
  ],
  [AIContextType.UNIT]: [
    { id: "u1", label: "What is the price?", prompt: "What is the price for this unit?" },
    { id: "u2", label: "What is the carpet area?", prompt: "What is the carpet area and total area of this unit?" },
    { id: "u3", label: "Which direction does it face?", prompt: "Which direction does this unit face and what view does it have?" },
    { id: "u4", label: "Calculate my EMI", prompt: "Calculate my monthly EMI for this unit with standard loan terms." },
    { id: "u5", label: "Compare with another unit", prompt: "How does this unit compare with neighboring available units?" },
  ],
  [AIContextType.FLOOR_PLAN]: [
    { id: "fp1", label: "Where is the master suite?", prompt: "Where is the master bedroom located in this floor plan?" },
    { id: "fp2", label: "Which rooms face the lake?", prompt: "Which rooms in this floor plan enjoy direct lake views?" },
    { id: "fp3", label: "What is the total area?", prompt: "What is the total internal and balcony area for this layout?" },
    { id: "fp4", label: "Compare with another 3 BHK", prompt: "How does this floor plan compare with alternative 3 BHK layouts?" },
  ],
  [AIContextType.VIEW]: [
    { id: "v1", label: "What am I looking at?", prompt: "What view and orientation am I looking at in this 3D preview?" },
    { id: "v2", label: "Which units have this view?", prompt: "Which specific units enjoy this exact view elevation?" },
    { id: "v3", label: "Which direction does this face?", prompt: "Which direction does this view face regarding sunlight?" },
    { id: "v4", label: "Show similar view residences", prompt: "Show me other residences that feature a similar view perspective." },
  ],
  [AIContextType.LOCATION]: [
    { id: "l1", label: "How far is the airport?", prompt: "How far is Amnaya from the international airport?" },
    { id: "l2", label: "What is nearby?", prompt: "What key social infrastructure, schools, and hospitals are nearby?" },
    { id: "l3", label: "Tell me about connectivity", prompt: "Tell me about road connectivity and transit options to major business hubs." },
    { id: "l4", label: "What schools are nearby?", prompt: "What top-tier international schools are close to Amnaya?" },
  ],
  [AIContextType.PRICING]: [
    { id: "pr1", label: "What would my EMI be?", prompt: "What would my monthly EMI be for a ₹2.5 Cr residence?" },
    { id: "pr2", label: "Required down payment?", prompt: "How much down payment would I need for booking?" },
    { id: "pr3", label: "Compare units financially", prompt: "Compare available units by price per sq. ft. and payment schedule." },
  ],
  [AIContextType.RECOMMENDATION]: [
    { id: "rc1", label: "Why is this a good match?", prompt: "Why is this specific unit recommended as a high match for me?" },
    { id: "rc2", label: "Explain match reasons", prompt: "Explain the match score and criteria breakdown for this unit." },
    { id: "rc3", label: "Show alternative matches", prompt: "Show me alternative unit recommendations matching my budget." },
  ],
  [AIContextType.COMPARISON]: [
    { id: "cm1", label: "Which has a better lake view?", prompt: "Which of these compared units offers a better lake view?" },
    { id: "cm2", label: "Which has lower EMI?", prompt: "Which unit results in a lower monthly EMI?" },
    { id: "cm3", label: "Explain main differences", prompt: "Explain the main differences between these compared units." },
  ],
  [AIContextType.FINANCIAL]: [
    { id: "fn1", label: "Why is the EMI this amount?", prompt: "Why is the EMI calculated at this specific monthly figure?" },
    { id: "fn2", label: "Effect of larger down payment", prompt: "How does increasing down payment to 30% affect my monthly payment?" },
    { id: "fn3", label: "Compare 15 vs 20 yr tenure", prompt: "Compare total interest payable between 15-year and 20-year loan tenures." },
  ],
  [AIContextType.SITE_VISIT]: [
    { id: "sv1", label: "Schedule a Private Visit", prompt: "I would like to schedule a private site visit to Amnaya." },
    { id: "sv2", label: "What happens during a visit?", prompt: "What can I expect during a private sales gallery tour?" },
  ],
};

export function getSuggestedPromptsForContext(pageType?: string | null): ContextualPrompt[] {
  if (!pageType) return CONTEXTUAL_PROMPTS[AIContextType.PROJECT] || [];
  return CONTEXTUAL_PROMPTS[pageType] || CONTEXTUAL_PROMPTS[AIContextType.PROJECT] || [];
}
