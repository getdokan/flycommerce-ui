"use client"

import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import {
  FiCheckCircle as CircleCheckIcon,
  FiInfo as InfoIcon,
  FiAlertTriangle as TriangleAlertIcon,
  FiXOctagon as OctagonXIcon,
} from "react-icons/fi"
import { LuLoaderCircle as Loader2Icon } from "react-icons/lu"

const Toaster = ({ theme = "light", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--sidebar)",
          "--normal-text": "#ffffff",
          "--normal-border": "transparent",
          "--border-radius": "var(--radius-panel)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { toast, Toaster }
