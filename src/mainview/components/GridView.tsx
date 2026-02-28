type GridItem = {
  id: string;
  name: string;
  desc: string;
};

type GridViewProps = {
  items: GridItem[];
  onItemClick: (item: GridItem) => void;
};

export function GridView({ items, onItemClick }: GridViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item)}
          className="border border-winamp-border bg-winamp-panel-alt p-6 cursor-pointer hover:border-winamp-accent-muted hover:bg-winamp-hover transition-all group"
        >
          <div className="text-winamp-accent text-lg font-bold mb-2 group-hover:text-winamp-text-bright">
            {item.name}
          </div>
          <div className="text-winamp-accent-muted text-sm">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
