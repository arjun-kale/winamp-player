import { Visualizer } from "./Visualizer";

type HeroHeaderProps = {
  title: string;
  subtitle: string;
  meta: React.ReactNode;
  ascii: string;
  isPlaying?: boolean;
};

export function HeroHeader({ title, subtitle, meta, ascii, isPlaying = true }: HeroHeaderProps) {
  return (
    <div className="h-64 border-b border-winamp-border p-8 flex flex-col justify-end relative overflow-hidden shrink-0">
      <div className="absolute inset-0 flex items-end gap-1 opacity-10 pointer-events-none pb-0 px-8">
        <Visualizer count={100} heightClass="h-full" isPlaying={isPlaying} />
      </div>
      <div className="relative z-10 flex gap-8 items-end">
        <div className="w-40 h-40 border border-winamp-border bg-winamp-panel-alt flex items-center justify-center p-2 text-[0.45rem] leading-[0.55rem] text-winamp-accent-muted select-none whitespace-pre font-mono">
          {ascii}
        </div>
        <div className="pb-2">
          <div className="text-winamp-accent-muted text-sm tracking-widest mb-2">{subtitle}</div>
          <h1 className="text-5xl font-bold text-winamp-accent tracking-wider mb-2">{title}</h1>
          <div className="text-winamp-text text-sm flex items-center gap-4">{meta}</div>
        </div>
      </div>
    </div>
  );
}
