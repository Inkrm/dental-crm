export default function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 " +
        "outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 " +
        (props.className || "")
      }
    />
  );
}
