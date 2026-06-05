import { getStore } from '@netlify/blobs'

const BASE_COUNT = 142

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const store = getStore('community')
    const raw = await store.get('member_count')
    const extra = raw ? parseInt(raw, 10) : 0
    const count = BASE_COUNT + extra
    return Response.json({ success: true, count })
  } catch {
    return Response.json({ success: true, count: BASE_COUNT })
  }
}

export const config = {
  path: '/api/member-count',
}
