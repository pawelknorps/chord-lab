import { Loader2 } from 'lucide-react';

interface ModuleSkeletonProps {
  label?: string;
  className?: string;
}

/**
 * Reusable skeleton placeholder for lazy-loaded modules.
 * Uses app design tokens; optional module-specific label.
 */
export function ModuleSkeleton({ label = 'Loading…', className = '' }: ModuleSkeletonProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full min-h-[50vh] text-[var(--text-muted)] p-10 animate-fade-in ${className}`}
      role="status"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" aria-hidden />
        <span className="text-xs uppercase font-bold tracking-widest opacity-80">{label}</span>
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-[var(--bg-hover)] animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[var(--bg-hover)] animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[var(--bg-hover)] animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
