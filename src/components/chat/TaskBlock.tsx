"use client";

interface TaskGroupProps {
  tasks: string[];
  isStreaming: boolean;
}

export default function TaskGroup({ tasks, isStreaming }: TaskGroupProps) {
  if (!tasks.length) return null;

  return (
    <div className="mb-3">
      {/* Header */}
      <span className={`text-sm font-medium ${isStreaming ? "text-neutral-600" : "text-neutral-400"}`}>
        {isStreaming ? "Processing your request" : "Processed your request"}
      </span>

      {/* Task lines with vertical border */}
      <div className="mt-1 ml-2 border-l-2 border-neutral-200 pl-3">
        {tasks.map((task, i) => (
          <p key={i} className="text-xs text-neutral-400 leading-relaxed">
            {task}
          </p>
        ))}
        {isStreaming && (
          <span className="inline-block w-1 h-3 bg-neutral-300 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}
