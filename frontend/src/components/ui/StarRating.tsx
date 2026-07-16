interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, maxStars = 5, size = "sm" }: StarRatingProps) {
  const textSize = size === "sm" ? "text-sm" : "text-lg";
  return (
    <span className={`${textSize}`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-amber-400" : "text-gray-300"}>★</span>
      ))}
    </span>
  );
}
