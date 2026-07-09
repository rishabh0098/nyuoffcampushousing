const GITHUB_REPO_URL = "https://github.com/rishabh0098/nyuoffcampushousing";

/**
 * Shown on every page (see RootLayout) so it's unmistakable that this is an
 * independent, volunteer-run, open-source project — not a commercial
 * product or an official NYU service.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border px-5 py-6 text-center text-xs text-ink-soft sm:px-8">
      <p>
        © {new Date().getFullYear()} NYU Off-Campus Housing — an independent, volunteer-run,
        open-source project. Not affiliated with or endorsed by New York University.
      </p>
      <p className="mt-1">
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-accent"
        >
          View source on GitHub
        </a>
        {" · "}
        <a
          href={`${GITHUB_REPO_URL}/blob/main/LICENSE`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-accent"
        >
          MIT License
        </a>
      </p>
    </footer>
  );
}
