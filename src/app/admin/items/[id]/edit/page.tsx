import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/glass"
import { ItemForm } from "../../ItemForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import EditImages from "./EditImages.client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from("items")
    .select(`
      *,
      measurements:item_measurements(*),
      images:item_images(
        id,
        image_url,
        is_primary,
        display_order
      )
    `)
    .eq("id", id)
    .order("display_order", { foreignTable: "item_images", ascending: true })
    .single()

  if (!item || error) notFound()

  const measurements = item.measurements?.[0] || item.measurements

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link href="/admin/items" className="inline-flex items-center gap-2 text-sm text-black/60">
        <ArrowLeft className="h-4 w-4" />
        Back to Items
      </Link>

      <h1 className="text-3xl font-semibold">Edit Item</h1>

      {/* ✅ IMAGES – CLIENT SIDE */}
      <GlassCard>
        <EditImages
          itemId={item.id}
          images={item.images}
        />
      </GlassCard>

      {/* ❌ ITEMFORM TAK DISENTUH */}
      <GlassCard>
        <ItemForm item={item} measurements={measurements} />
      </GlassCard>
    </div>
  )
}
