import { getStore } from '@netlify/blobs'

const BASE_COUNT = 142

export default async (req) => {
  try {
    const body = await req.json()
    const payload = body.payload || {}

    if (payload.form_name !== 'join') {
      return new Response('OK')
    }

    const store = getStore('community')
    const raw = await store.get('member_count')
    const current = raw ? parseInt(raw, 10) : 0
    await store.set('member_count', String(current + 1))
  } catch (err) {
    console.error('submission-created error:', err)
  }

  return new Response('OK')
}
