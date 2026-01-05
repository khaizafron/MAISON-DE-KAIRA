export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin"
import { GlassCard, GlassButton } from "@/components/glass"
import { getPublicImageUrl } from "@/lib/supabase/storage"
import Link from "next/link"
import Image from "next/image"
import { Plus, Edit } from "lucide-react"
import { DeleteItemButton } from "./DeleteItemButton"

export default async function AdminItemsPage() {
  const supabase = createAdminClient()

  const { data: items } = await supabase
    .from("items")
    .select(`
      *,
      images:item_images(*)
    `)
    .order("created_at", { ascending: false })

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-black/90">Items</h1>
        <Link href="/admin/items/new">
          <GlassButton className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </GlassButton>
        </Link>
      </div>

      {/* ================= DESKTOP TABLE (UNCHANGED) ================= */}
      <GlassCard className="hidden overflow-hidden p-0 md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 bg-black/5 text-left text-sm text-black/60">
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => {
              const primaryImage =
                item.images?.find((img: any) => img.is_primary) ||
                item.images?.[0]

              const imageUrl = getPublicImageUrl(primaryImage?.image_url)

              return (
                <tr key={item.id} className="border-b border-black/5">
                  <td className="p-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-black/5">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-black/30">
                          No img
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4">RM {Number(item.price).toFixed(0)}</td>

                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/items/${item.id}/edit`}>
                        <GlassButton variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </GlassButton>
                      </Link>
                      <DeleteItemButton
                        itemId={item.id}
                        itemTitle={item.title}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!items || items.length === 0) && (
          <div className="p-10 text-center text-black/60">
            No items yet. Add your first item!
          </div>
        )}
      </GlassCard>

      {/* ================= MOBILE CARDS ================= */}
      <div className="space-y-4 md:hidden">
        {items?.map((item) => {
          const primaryImage =
            item.images?.find((img: any) => img.is_primary) ||
            item.images?.[0]

          const imageUrl = getPublicImageUrl(primaryImage?.image_url)

          return (
            <GlassCard key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* IMAGE */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/5">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-black/30">
                      No img
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex flex-1 flex-col">
                  <div className="font-medium text-black/90">
                    {item.title}
                  </div>

                  <div className="mt-1 text-sm text-black/60">
                    RM {Number(item.price).toFixed(0)}
                  </div>

                  <span
                    className={`mt-2 inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/items/${item.id}/edit`}
                  className="flex-1"
                >
                  <GlassButton className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </GlassButton>
                </Link>

                <DeleteItemButton
                  itemId={item.id}
                  itemTitle={item.title}
                />
              </div>
            </GlassCard>
          )
        })}

        {(!items || items.length === 0) && (
          <GlassCard className="p-10 text-center text-black/60">
            No items yet. Add your first item!
          </GlassCard>
        )}
      </div>
    </div>
  )
}
