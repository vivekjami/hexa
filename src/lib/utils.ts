import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number = 200) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function extractDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}