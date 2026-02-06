export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium " +
        "bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed " +
        className
      }
    >
      {children}
    </button>
  );
}
