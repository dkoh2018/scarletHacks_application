"use client"

import React from "react"
import Image from "next/image"

export function MinimalCard({ children, className, ...props }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border bg-card-bg transition-all hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function MinimalCardImage({ src, alt, className, ...props }) {
  return (
    <div className="relative h-48 w-full overflow-hidden">
      {src ? (
        <Image
          src={src}
          alt={alt || "Card image"}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${className}`}
          width={400}
          height={300}
          {...props}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
          <span className="text-center p-2">Recipe Image</span>
        </div>
      )}
    </div>
  )
}

export function MinimalCardTitle({ children, className, ...props }) {
  return (
    <h3
      className={`mt-4 px-4 text-xl font-semibold text-foreground ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function MinimalCardDescription({ children, className, ...props }) {
  return (
    <p
      className={`mt-2 px-4 pb-4 text-muted ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}

export function MinimalCardContent({ children, className, ...props }) {
  return (
    <div
      className={`mt-4 px-4 pb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
