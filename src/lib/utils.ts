import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function getViewportHeight() {
  const height = window.innerHeight;
  console.log('Viewport inner height:', height + 'px');
  return height;
}
