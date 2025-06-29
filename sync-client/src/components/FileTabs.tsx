// components/FileTabs.tsx

interface FileTabsProps {
  files: string[];
  active?: string;
}

export function FileTabs({ files, active }: FileTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 mb-2 text-sm text-gray-300">
      {files.map((f) => {
        const isActive = f === active;
        return (
          <div
            key={f}
            className={`px-3 py-1 border-b-2 ${
              isActive
                ? 'border-yellow-400 bg-zinc-800 text-white font-bold'
                : 'border-transparent bg-zinc-700 hover:bg-zinc-600'
            }`}
          >
            {f.split('/').pop()}
          </div>
        );
      })}
    </div>
  );
}
