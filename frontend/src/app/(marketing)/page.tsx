import { siteConfig } from "@config/site";

import { PagePlaceholder } from "@components/composite/page-placeholder";

export default function HomePage() {
  return (
    <PagePlaceholder
      eyebrow={siteConfig.name}
      title="Welcome"
      description="The marketing homepage will be built here in Phase 6.2. This placeholder only proves the routing foundation."
    />
  );
}
