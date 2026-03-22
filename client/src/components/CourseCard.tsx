import { Link } from "wouter";
import { Star, Clock, Monitor, MapPin, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: {
    id: number;
    slug: string;
    title: string;
    descriptionShort: string;
    price: number;
    priceFormatted?: string;
    durationHours: number;
    format: string;
    avgRating: number;
    reviewCount: number;
    imageUrl?: string | null;
    category?: {
      name: string;
      color: string;
    } | null;
    instructor?: {
      displayName: string;
    } | null;
  };
}

const formatMap: Record<string, { label: string; icon: any; color: string }> = {
  ONLINE: { label: "Online", icon: Monitor, color: "#1E3A5F" },
  PHYSICAL: { label: "Fiziksel", icon: MapPin, color: "#D4451A" },
  HYBRID: { label: "Hibrit", icon: Layers, color: "#6A1B9A" },
};

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " TL";
}

export default function CourseCard({ course }: CourseCardProps) {
  const fmt = formatMap[course.format] || formatMap["ONLINE"];
  const FormatIcon = fmt.icon;

  const displayPrice = course.priceFormatted || formatPrice(course.price);

  return (
    <Link href={`/egitim/${course.slug}`} data-testid={`card-course-${course.id}`}>
      <div className="group bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#142240] to-[#1A8A7D] flex items-center justify-center">
              <span className="text-white/30 text-4xl font-display">{course.title.charAt(0)}</span>
            </div>
          )}
          {/* Category badge */}
          {course.category && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: course.category.color }}
            >
              {course.category.name}
            </div>
          )}
          {/* Format badge */}
          <div
            className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1"
            style={{ backgroundColor: fmt.color + "cc" }}
          >
            <FormatIcon className="w-3 h-3" />
            {fmt.label}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-[#E8872A] transition-colors">
            {course.title}
          </h3>

          {course.instructor && (
            <p className="text-xs text-muted-foreground mb-2">{course.instructor.displayName}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(course.avgRating)
                      ? "text-[#E8872A] fill-[#E8872A]"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {course.avgRating.toFixed(1)} ({course.reviewCount})
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.durationHours} saat</span>
            </div>
            <span className="font-semibold text-[#E8872A] text-base font-body">
              {displayPrice}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
