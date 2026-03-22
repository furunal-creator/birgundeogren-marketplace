import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import CourseCard from "@/components/CourseCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COURSES, CATEGORIES } from "@/data/courses";

const PAGE_SIZE = 12;

const FORMATS = [
  { value: "ONLINE", label: "Online" },
  { value: "PHYSICAL", label: "Fiziksel" },
  { value: "HYBRID", label: "Hibrit" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen" },
  { value: "price_asc", label: "Fiyat ↑" },
  { value: "price_desc", label: "Fiyat ↓" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "newest", label: "Yeni Eklenenler" },
];

export default function Catalog() {
  const [, setLocation] = useLocation();

  // Parse initial query params from hash URL
  const getInitial = () => {
    if (typeof window === "undefined") return {};
    const hash = window.location.hash;
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return {};
    const params = new URLSearchParams(hash.slice(qIdx + 1));
    return {
      kategori: params.get("kategori") || "",
      format: params.get("format") || "",
      q: params.get("q") || "",
      sort: params.get("sort") || "recommended",
    };
  };
  const init = getInitial();

  const [searchInput, setSearchInput] = useState(init.q || "");
  const [searchQuery, setSearchQuery] = useState(init.q || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    init.kategori ? [init.kategori] : []
  );
  const [selectedFormats, setSelectedFormats] = useState<string[]>(
    init.format ? [init.format] : []
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sort, setSort] = useState(init.sort || "recommended");
  const [page, setPage] = useState(1);
  const [useApi, setUseApi] = useState(true);

  // Build API query string
  const apiParams = useMemo(() => {
    const params: Record<string, string> = {
      sort,
      page: String(page),
      limit: String(PAGE_SIZE),
    };
    if (selectedCategories.length === 1) params.kategori = selectedCategories[0];
    if (selectedFormats.length === 1) params.format = selectedFormats[0];
    if (priceRange[0] > 0) params.priceMin = String(priceRange[0]);
    if (priceRange[1] < 10000) params.priceMax = String(priceRange[1]);
    if (searchQuery.trim()) params.q = searchQuery.trim();
    return new URLSearchParams(params).toString();
  }, [selectedCategories, selectedFormats, priceRange, searchQuery, sort, page]);

  // Fetch courses from API
  const { data: apiData, isLoading: isLoadingCourses } = useQuery<any>({
    queryKey: ["/api/courses", apiParams],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/courses?${apiParams}`);
        if (res.ok) {
          setUseApi(true);
          return res.json();
        }
        throw new Error("API unavailable");
      } catch {
        setUseApi(false);
        return null;
      }
    },
  });

  // Fetch categories from API
  const { data: apiCategories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) return res.json();
        throw new Error("API unavailable");
      } catch {
        return CATEGORIES;
      }
    },
  });

  const displayCategories = apiCategories ?? CATEGORIES;

  // Static fallback filtering (when API is not available)
  const staticFiltered = useMemo(() => {
    if (useApi && apiData) return [];

    let result = [...COURSES];
    if (selectedCategories.length > 0) {
      result = result.filter(c => selectedCategories.includes(c.category.slug));
    }
    if (selectedFormats.length > 0) {
      result = result.filter(c => selectedFormats.includes(c.format));
    }
    result = result.filter(c => c.price >= priceRange[0] && c.price <= priceRange[1]);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.category.name.toLowerCase().includes(q) ||
        c.descriptionShort.toLowerCase().includes(q) ||
        (c.targetAudience && c.targetAudience.toLowerCase().includes(q))
      );
    }
    if (sort === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "rating") result.sort((a, b) => b.avgRating - a.avgRating);
    else if (sort === "newest") result.sort((a, b) => b.id - a.id);
    else {
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.avgRating - a.avgRating;
      });
    }
    return result;
  }, [useApi, apiData, selectedCategories, selectedFormats, priceRange, searchQuery, sort]);

  // Determine displayed courses
  const apiCourses = apiData?.courses ?? [];
  const apiTotal = apiData?.total ?? 0;
  const apiTotalPages = apiData?.totalPages ?? 1;

  const staticTotalPages = Math.ceil(staticFiltered.length / PAGE_SIZE);
  const staticPaginated = staticFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const displayCourses = (useApi && apiData) ? apiCourses : staticPaginated;
  const totalCount = (useApi && apiData) ? apiTotal : staticFiltered.length;
  const totalPages = (useApi && apiData) ? apiTotalPages : staticTotalPages;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const toggleFormat = (fmt: string) => {
    setSelectedFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
    setPage(1);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedFormats([]);
    setPriceRange([0, 10000]);
    setSearchQuery("");
    setSearchInput("");
    setSort("recommended");
    setPage(1);
  };

  const hasFilters = selectedCategories.length > 0 || selectedFormats.length > 0 ||
    priceRange[0] > 0 || priceRange[1] < 10000 || searchQuery;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Kategoriler</h3>
        <div className="space-y-2">
          {displayCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
                data-testid={`checkbox-cat-${cat.slug}`}
              />
              <Label
                htmlFor={`cat-${cat.slug}`}
                className="text-sm cursor-pointer flex items-center gap-2"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-muted-foreground text-xs ml-auto">({cat.courseCount})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Format */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Format</h3>
        <div className="space-y-2">
          {FORMATS.map((fmt) => (
            <div key={fmt.value} className="flex items-center gap-2">
              <Checkbox
                id={`fmt-${fmt.value}`}
                checked={selectedFormats.includes(fmt.value)}
                onCheckedChange={() => toggleFormat(fmt.value)}
                data-testid={`checkbox-format-${fmt.value}`}
              />
              <Label htmlFor={`fmt-${fmt.value}`} className="text-sm cursor-pointer">
                {fmt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Fiyat Aralığı</h3>
        <Slider
          value={priceRange}
          onValueChange={(v) => { setPriceRange(v); setPage(1); }}
          min={0}
          max={5000}
          step={100}
          className="mb-3"
          data-testid="slider-price"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString("tr-TR")} TL</span>
          <span>{priceRange[1] >= 5000 ? "5.000+ TL" : `${priceRange[1].toLocaleString("tr-TR")} TL`}</span>
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="w-full border-destructive text-destructive hover:bg-destructive/10"
          data-testid="button-clear-filters"
        >
          <X className="w-3.5 h-3.5 mr-2" />
          Filtreleri Temizle
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[#0A1628] pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Tüm Eğitimler</h1>
          <p className="text-white/60">
            {totalCount} eğitim bulundu
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Eğitim ara..."
                className="w-full border border-border rounded-lg pl-9 pr-4 py-2 text-sm bg-background focus:outline-none focus:border-[#E8872A] transition-colors"
                data-testid="input-search-catalog"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="hidden sm:flex">
              Ara
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }} data-testid="select-sort">
              <SelectTrigger className="w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden flex items-center gap-2" data-testid="button-mobile-filters">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtreler
                  {hasFilters && (
                    <span className="bg-[#E8872A] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtreler</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filtreler</h2>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-[#E8872A] hover:underline">
                    Temizle
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters */}
            {(selectedCategories.length > 0 || selectedFormats.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map(slug => {
                  const cat = displayCategories.find((c: any) => c.slug === slug);
                  return cat ? (
                    <button
                      key={slug}
                      onClick={() => toggleCategory(slug)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name} <X className="w-3 h-3" />
                    </button>
                  ) : null;
                })}
                {selectedFormats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E8872A] text-white"
                  >
                    {FORMATS.find(f => f.value === fmt)?.label} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {isLoadingCourses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : displayCourses.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">😕</div>
                <h3 className="font-display text-xl font-bold mb-2">Eğitim bulunamadı</h3>
                <p className="text-muted-foreground mb-4">Filtrelerinizi değiştirerek tekrar deneyin.</p>
                <Button onClick={clearAll} variant="outline">Filtreleri Temizle</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayCourses.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - page) <= 2)
                      .map(p => (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={p === page ? "bg-[#E8872A] hover:bg-[#d07020] text-white border-0" : ""}
                          data-testid={`button-page-${p}`}
                        >
                          {p}
                        </Button>
                      ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
