import * as React from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  ghost: "button-ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-6 py-3 text-sm rounded-full",
  lg: "px-7 py-4 text-sm rounded-full",
  icon: "p-2.5 rounded-full",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>(function Button({ className, variant = "secondary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "transition-premium inline-flex items-center justify-center gap-2 font-semibold",
        variantClasses[variant],
        sizeClasses[size],
        props.disabled && "opacity-50 pointer-events-none",
        className,
      )}
      {...props}
    />
  );
});

export function LinkButton({
  className,
  variant = "secondary",
  size = "md",
  ...props
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      className={cn(
        "transition-premium inline-flex items-center justify-center gap-2 font-semibold",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

