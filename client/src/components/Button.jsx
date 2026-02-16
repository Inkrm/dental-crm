const BASE =
  "box-border border shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-1 focus:outline-none focus:ring-4 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS = {
  default:
    "text-white bg-brand border-transparent hover:bg-brand-strong focus:ring-brand-medium",
  secondary:
    "text-body bg-neutral-secondary-medium border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-neutral-tertiary",
  tertiary:
    "text-body bg-neutral-primary-soft border-default hover:bg-neutral-secondary-medium hover:text-heading focus:ring-neutral-tertiary-soft",
  success:
    "text-white bg-success border-transparent hover:bg-success-strong focus:ring-success-medium",
  danger:
    "text-white bg-danger border-transparent hover:bg-danger-strong focus:ring-danger-medium",
  warning:
    "text-white bg-warning border-transparent hover:bg-warning-strong focus:ring-warning-medium",
  dark: "text-white bg-dark border-transparent hover:bg-dark-strong focus:ring-neutral-tertiary",
  ghost:
    "text-heading bg-transparent border-transparent hover:bg-neutral-secondary-medium focus:ring-neutral-tertiary",
};

export default function Button({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <button
      {...props}
      className={`${BASE} ${variantClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
