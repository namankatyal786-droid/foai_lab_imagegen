import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const NeoButton = forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[#00FF00] hover:bg-[#00DD00] text-black",
      secondary: "bg-[#FF00FF] hover:bg-[#DD00DD] text-white",
      danger: "bg-[#FF0000] hover:bg-[#DD0000] text-white",
      ghost: "bg-white hover:bg-gray-100 text-black",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-6 py-3 text-sm font-bold",
      lg: "px-8 py-4 text-lg font-black",
    };

    return (
      <motion.button
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ x: 0, y: 0 }}
        ref={ref}
        className={cn(
          "relative border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

NeoButton.displayName = "NeoButton";

export { NeoButton };
