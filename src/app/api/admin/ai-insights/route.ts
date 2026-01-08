import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // =========================
    // 1. ITEMS
    // =========================
    const { data: items = [] } = await supabase
      .from('items')
      .select('id, title, price, status')

    const totalItems = items.length

    const soldItems = items.filter(
      i => i.status === 'sold' || i.status === 'offline_sold'
    )

    const availableItems = items.filter(i => i.status === 'available')

    const totalRevenue = soldItems.reduce(
      (sum, i) => sum + Number(i.price || 0),
      0
    )

    // =========================
    // 2. WEEK VISITORS (✅ FIXED)
    // =========================
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: weekViews = [] } = await supabase
      .from('analytics_item_views')
      .select('visitor_id')
      .gte('created_at', sevenDaysAgo)

    const weekVisitors = new Set(
      weekViews.map(v => v.visitor_id)
    ).size

    // =========================
    // 3. TOP DEMAND ITEM
    // =========================
    const [{ data: viewStats = [] }, { data: waStats = [] }] =
      await Promise.all([
        supabase.from('analytics_item_views').select('item_id'),
        supabase.from('whatsapp_clicks').select('item_id'),
      ])

    const demandMap = new Map<string, number>()

    viewStats.forEach(v => {
      demandMap.set(v.item_id, (demandMap.get(v.item_id) || 0) + 1)
    })

    waStats.forEach(w => {
      demandMap.set(w.item_id, (demandMap.get(w.item_id) || 0) + 3)
    })

    let topDemandItem = 'N/A'
    let maxScore = 0

    demandMap.forEach((score, itemId) => {
      if (score > maxScore) {
        maxScore = score
        const item = items.find(i => i.id === itemId)
        if (item) topDemandItem = item.title
      }
    })

    // =========================
    // 4. TOP COLLECTION (SOLD)
    // =========================
    const topCollection =
      soldItems.length > 0
        ? soldItems.sort((a, b) => Number(b.price) - Number(a.price))[0].title
        : 'N/A'

    // =========================
    // 5. METRICS
    // =========================
    const metrics = {
      totalItems,
      availableItems: availableItems.length,
      soldItems: soldItems.length,
      totalRevenue,
      weekVisitors,
      topCollection,
      topDemandItem,
    }

    // =========================
    // 6. AI PROMPT
    // =========================
    const prompt = `
You are a senior AI Business Analyst for Kaira Atelier.

Generate 3–4 concise, actionable insights based on REAL demand signals.

Metrics:
- Total Items: ${metrics.totalItems}
- Available Items: ${metrics.availableItems}
- Sold Items: ${metrics.soldItems}
- Revenue: RM${metrics.totalRevenue}
- Weekly Visitors: ${metrics.weekVisitors}
- Top Collection (Sold): ${metrics.topCollection}
- Top Demand Item: ${metrics.topDemandItem}

Rules:
- Reference Top Demand Item clearly
- Focus on inventory & conversion actions
- Bullet points only
`

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiJson = await aiRes.json()
    const insightText =
      aiJson.choices?.[0]?.message?.content ?? 'No insight.'

    await supabase.from('ai_insight_logs').insert({
      insight_text: insightText,
      metrics,
    })

    return NextResponse.json({
      insight: insightText,
      metrics,
      cached: false,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'AI insight failed' }, { status: 500 })
  }
}

export async function GET() {
  const { data } = await supabase
    .from('ai_insight_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    insight: data?.insight_text ?? null,
    metrics: data?.metrics ?? null,
    cached: true,
  })
}
