export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a
          href="/"
          className="flex items-baseline gap-2"
          aria-label="Zenbu TCG home"
        >
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ZENBU
          </span>
          <span lang="ja" className="font-zen text-sm text-gold">
            全部
          </span>
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href="/#sets"
            className="text-muted transition-colors hover:text-foreground"
          >
            Sets
          </a>
          <a
            href="/#how"
            className="text-muted transition-colors hover:text-foreground"
          >
            How it works
          </a>
          {/* <a
            href="/test-pack"
            className="rounded-full border border-gold/40 px-3.5 py-2 font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10"
          >
            Test Pack
          </a> */}
        </nav>
      </div>
    </header>
  );
}
