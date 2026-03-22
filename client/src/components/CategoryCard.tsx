import { Link } from "wouter";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon: string;
    imageUrl?: string | null;
    courseCount: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/katalog?kategori=${category.slug}`} data-testid={`card-category-${category.id}`}>
      <div
        className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ backgroundColor: category.color }}
      >
        {/* Background image */}
        {category.imageUrl && (
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Content */}
        <div className="relative p-5 flex flex-col items-start gap-2 min-h-[130px]">
          <span className="text-3xl">{category.icon}</span>
          <h3 className="text-white font-display font-bold text-sm leading-tight">
            {category.name}
          </h3>
          <p className="text-white/80 text-xs mt-auto">
            {category.courseCount} eğitim
          </p>
        </div>
      </div>
    </Link>
  );
}
