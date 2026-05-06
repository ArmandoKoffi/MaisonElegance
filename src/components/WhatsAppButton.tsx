import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface Props {
  message: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
}

export const WhatsAppButton = ({
  message,
  children = "Commander sur WhatsApp",
  className,
  variant = "solid",
  size = "md",
}: Props) => {
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const styles =
    variant === "solid"
      ? "bg-whatsapp text-whatsapp-foreground"
      : "border border-primary text-primary";
  return (
    <a
      href={buildWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all duration-300 shadow-soft btn-press btn-slide",
        sizes[size],
        styles,
        className
      )}
    >
      <MessageCircle className="w-4 h-4 relative z-10" />
      <span className="relative z-10">{children}</span>
    </a>
  );
};
