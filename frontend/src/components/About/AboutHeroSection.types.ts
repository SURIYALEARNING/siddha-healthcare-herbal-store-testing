import type { ReactNode } from "react";

export interface AboutHeroSectionProps {
  title: string;
  subtitle?: string;
  description: ReactNode;
  secondDescription?: ReactNode;
  image?: string;
  images?: string[];
  badgeText?: string;
  reverse?: boolean;
  square?: boolean;
  className?: string;
}
