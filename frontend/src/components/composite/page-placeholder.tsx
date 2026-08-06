import type { ReactNode } from "react";

type PagePlaceholderProps = {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
};

/**
 * Temporary scaffold used while the routing foundation is in place.
 * Business pages will replace these stubs; do not build real content here.
 */
export function PagePlaceholder({ title, description, eyebrow }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <div className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</div>
      ) : null}
    </section>
  );
}
