export default function Input(props) {
  return (
    <input
      {...props}
      className={
        "ui-input w-full rounded-md px-3 py-2 text-sm " +
        (props.className || "")
      }
    />
  );
}
