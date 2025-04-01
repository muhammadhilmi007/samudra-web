"use client"

import { ToastProvider } from "./use-toast"

export function Toaster({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}