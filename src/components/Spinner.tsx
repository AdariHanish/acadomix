// Spinning loader for inline use (small, medium, large)
export function Spinner({ size = 'md', color = 'crimson' }: { size?: 'sm' | 'md' | 'lg'; color?: 'crimson' | 'gold' | 'white' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-[3px]', lg: 'w-12 h-12 border-4' };
  const colors = {
    crimson: 'border-crimson/20 border-t-crimson',
    gold: 'border-gold/20 border-t-gold',
    white: 'border-white/20 border-t-white',
  };
  return (
    <span
      className={`inline-block rounded-full animate-spin ${sizes[size]} ${colors[color]}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

// Full page / section centered spinner
export function SpinnerOverlay({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <span className="block w-14 h-14 rounded-full border-4 border-crimson/10 border-t-crimson animate-spin" />
        <span className="block w-14 h-14 rounded-full border-4 border-gold/10 border-b-gold animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
      </div>
      <p className="text-sm text-white/30 animate-pulse">{label}</p>
    </div>
  );
}
