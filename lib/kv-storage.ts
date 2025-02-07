import { kv } from "@vercel/kv"

export async function setValue(key: string, value: any) {
  await kv.set(key, JSON.stringify(value))
}

export async function getValue(key: string) {
  const value = await kv.get(key)
  return value ? JSON.parse(value as string) : null
}

export async function deleteValue(key: string) {
  await kv.del(key)
}

export async function getAllKeys(prefix: string) {
  return kv.keys(prefix)
}

