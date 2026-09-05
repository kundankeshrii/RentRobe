import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[3/4] w-full" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
);

export default ProductCardSkeleton;
