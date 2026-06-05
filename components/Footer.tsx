export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight text-foreground">
            ZENBU
          </span>
          <span lang="ja" className="text-sm text-gold">
            全部
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-6 text-muted">
          Zenbu TCG is an independent fan project. Not affiliated with,
          sponsored, or endorsed by Nintendo, Creatures Inc., Game Freak, or The
          Pokémon Company. Pokémon and all related names are trademarks of their
          respective owners.
        </p>
        <p className="mt-6 text-xs text-muted">© 2026 Zenbu TCG</p>
      </div>
    </footer>
  );
}
