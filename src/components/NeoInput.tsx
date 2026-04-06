import { cn } from "@/src/lib/utils";
import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from "react";

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const NeoInput = forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400",
          className
        )}
        {...props}
      />
    );
  }
);

NeoInput.displayName = "NeoInput";

interface NeoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NeoTextarea = forwardRef<HTMLTextAreaElement, NeoTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 min-h-[100px] resize-none",
          className
        )}
        {...props}
      />
    );
  }
);

NeoTextarea.displayName = "NeoTextarea";

export { NeoInput, NeoTextarea };
