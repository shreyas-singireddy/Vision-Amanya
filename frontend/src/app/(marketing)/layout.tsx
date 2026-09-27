/** Public marketing shell — header + main + footer.
 *
 * The global chrome (`SiteHeader`, `SiteFooter`) wraps the routed page with a
 * `PageTransition` so every public page inherits the same frame, skip-link
 * target and scroll restoration. `main` carries the `#main-content` id
 * consumed by the skip link.
 */

import { PageTransition } from "@components/motion";
import { SiteFooter, SiteHeader } from "@components/layout";
import { AIConsultantTrigger, AIConsultantWidget } from "@components/amnaya/ai-consultant";

import { AskAmnaya, AIChatDrawer } from "@components/ai";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <AIConsultantTrigger mode="global" />
      <AIConsultantWidget />
      <AskAmnaya variant="floating" />
      <AIChatDrawer />
    </div>
  );
}
