type DataTableProps = {
  columns: string[];
  rows: string[][];
};

export default function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
      <div
        className="grid border-b border-white/10 px-5 py-4 text-xs uppercase tracking-widest text-slate-500"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>

      {rows.map((row, index) => (
        <div
          key={index}
          className="grid border-b border-white/10 px-5 py-5 text-sm last:border-b-0 hover:bg-white/[0.03]"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, cellIndex) => (
            <span
              key={cellIndex}
              className={
                cell.includes("+") || cell === "Active"
                  ? "font-medium text-emerald-400"
                  : cell === "Review" || cell === "Pending"
                  ? "font-medium text-yellow-400"
                  : "text-slate-300"
              }
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}