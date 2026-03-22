import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClass = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const active = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-transform ${!readonly && "hover:scale-110"}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          data-testid={`star-${star}`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= active
                ? "text-[#E8872A] fill-[#E8872A]"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
