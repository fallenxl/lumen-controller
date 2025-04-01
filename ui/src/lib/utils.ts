import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function  parseDateOffset(date: string) {
  const localDate = new Date(date); // Interpreta como local
  return localDate.getTime() - localDate.getTimezoneOffset() * 60000; // Ajuste a UTC
}
