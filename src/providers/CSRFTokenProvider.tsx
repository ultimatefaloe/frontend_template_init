'use client';

// import { getCSRFToken } from "@/lib/csrf";
import { useEffect, ReactNode } from 'react';

interface CSRFTokenProviderProps {
  children: ReactNode;
}

const CSRFTokenProvider = ({ children }: CSRFTokenProviderProps) => {
  useEffect(() => {
    // getCSRFToken();
  }, []);
  return children || null;
};

export default CSRFTokenProvider;
