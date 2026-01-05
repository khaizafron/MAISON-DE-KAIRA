"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Star, ArrowUp, ArrowDown, Plus } from "lucide-react"

interface ImageRow {
  id: string
  image_url: string
  is_primary: boolean
  display_order: number
}

interface Props {
  itemId: string
  images: ImageRow[]
}

export default function EditImages({ itemId, images }: Props) {
  const supabase = createClient()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  /* ================= FILE PICK ================= */
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setFiles(Array.from(e.target.files))
  }

  /* ================= ADD IMAGES ================= */
  const addImages = async () => {
    if (!files.length) return
    setLoading(true)

    const { data: last } = await supabase
      .from("item_images")
      .select("display_order")
      .eq("item_id", itemId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    let order = (last?.display_order ?? -1) + 1

    for (const file of files) {
      const path = `${itemId}/${crypto.randomUUID()}.jpg`

      const { error: uploadError } = await supabase
        .storage
        .from("item-images")
        .upload(path, file, { upsert: false })

      if (uploadError) {
        alert(uploadError.message)
        setLoading(false)
        return
      }

      const { data } = supabase
        .storage
        .from("item-images")
        .getPublicUrl(path)

      await supabase.from("item_images").insert({
        item_id: itemId,
        image_url: data.publicUrl,
        is_primary: false,
        display_order: order++,
      })
    }

    location.reload()
  }

  /* ================= ACTIONS ================= */
  const setPrimary = async (id: string) => {
    await supabase.from("item_images")
      .update({ is_primary: false })
      .eq("item_id", itemId)

    await supabase.from("item_images")
      .update({ is_primary: true })
      .eq("id", id)

    location.reload()
  }

  const remove = async (id: string) => {
    await supabase.from("item_images").delete().eq("id", id)
    location.reload()
  }

  const swap = async (a: ImageRow, b: ImageRow) => {
    await supabase.from("item_images").update({ display_order: b.display_order }).eq("id", a.id)
    await supabase.from("item_images").update({ display_order: a.display_order }).eq("id", b.id)
    location.reload()
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-black/80">Images</h2>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white">
          <Plus size={16} />
          Add Images
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
        </label>
      </div>

      {files.length > 0 && (
        <button
          onClick={addImages}
          disabled={loading}
          className="rounded-full bg-black px-4 py-2 text-sm text-white"
        >
          {loading ? "Uploading..." : `Upload ${files.length} image(s)`}
        </button>
      )}

      <div className="grid grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-2xl border bg-white"
          >
            <img
              src={img.image_url}
              className="h-40 w-full object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 flex items-start justify-end gap-1 p-2 opacity-0 transition group-hover:opacity-100 bg-black/30">
              <button onClick={() => setPrimary(img.id)}>
                <Star
                  size={18}
                  className={img.is_primary ? "text-yellow-400" : "text-white"}
                />
              </button>
              <button onClick={() => remove(img.id)}>
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* ORDER */}
            <div className="flex items-center justify-between px-3 py-2 text-xs text-black/60">
              {index > 0 ? (
                <button onClick={() => swap(img, images[index - 1])}>
                  <ArrowUp size={14} />
                </button>
              ) : <span />}

              {img.is_primary && <span className="text-green-600 font-medium">Primary</span>}

              {index < images.length - 1 ? (
                <button onClick={() => swap(img, images[index + 1])}>
                  <ArrowDown size={14} />
                </button>
              ) : <span />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
