"use client"

import { toast } from "sonner"
import type { ToasterProps } from "sonner"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

type ToastType = "success" | "error" | "info" | "loading"

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
}

export const toaster = {
  create({ title, description, type = "info" }: ToastOptions) {
    const message = description ?? ""
    switch (type) {
      case "success":
        toast.success(title, { description: message })
        break
      case "error":
        toast.error(title, { description: message })
        break
      case "loading":
        toast.loading(title, { description: message })
        break
      case "info":
      default:
        toast(title, { description: message })
        break
    }
  },
}

export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />
}
