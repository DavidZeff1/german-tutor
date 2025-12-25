export default function RecordingIndicator({ duration }) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return (
    <div className="flex items-center gap-2 text-red-500">
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm font-mono">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
