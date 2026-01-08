"use client"

import { GlassButton } from "@/components/glass"
import { MessageCircle } from "lucide-react"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function getVisitorIdSafe() {
  if (typeof window === "undefined") return null
  let id = window.localStorage.getItem("visitor_id")
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    window.localStorage.setItem("visitor_id", id)
  }
  return id
}

interface WhatsAppButtonProps {
  item: { id: string; title: string; slug: string }
}

export function WhatsAppButton({ item }: WhatsAppButtonProps) {
  const handleClick = () => {
    // Open WhatsApp
    const productUrl = `${window.location.origin}/collection/${item.slug}`
    const message = encodeURIComponent(
      `Hi 👋\nMay I check if this item is still available?\n\n${item.title}\n${productUrl}\n\nThank you.`
    )
    window.open(`https://wa.me/601126941552?text=${message}`, "_blank", "noopener,noreferrer")

    // Track - NO AWAIT, fire and forget
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const visitorId = getVisitorIdSafe()
    if (visitorId) {
      supabase.from("whatsapp_clicks").insert({
        item_id: item.id,
        visitor_id: visitorId,
      }).then(({ error }) => {
        if (error) console.error('Track failed:', error.message)
      })
    }
  }

  return (
    <GlassButton onClick={handleClick} className="w-full gap-2" size="lg">
      <MessageCircle className="h-5 w-5" />
      Buy via WhatsApp
    </GlassButton>
  )
}