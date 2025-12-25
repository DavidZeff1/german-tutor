export default function TutorAvatar({ isSpeaking }) {
  return (
    <div className="relative">
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" />
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-pulse opacity-30" />
        </>
      )}

      <div
        className={`relative rounded-full overflow-hidden border transition-all duration-300 ${
          isSpeaking
            ? "border-amber-400 shadow-md shadow-amber-200"
            : "border-amber-100"
        }`}
        style={{ width: "100px", height: "100px" }}
      >
        <img
          src="https://api.dicebear.com/7.x/personas/svg?seed=Frau&backgroundColor=fef3c7&hair=long&hairColor=6b4423&mouth=smile&eyes=happy&skinColor=f5d0c5"
          alt="Frau Müller"
          className="w-full h-full object-cover"
        />
      </div>

      {isSpeaking && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-px">
          <div className="w-0.5 h-1 bg-amber-500 rounded-full animate-bounce" />
          <div
            className="w-0.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="w-0.5 h-1 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: "200ms" }}
          />
        </div>
      )}
    </div>
  );
}
