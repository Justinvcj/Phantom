'use server'

import { createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"

import postgres from 'postgres'

const ToggleActionItemSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean()
})

export async function toggleActionItem(rawId: string, rawCompleted: boolean) {
  const { id, completed } = ToggleActionItemSchema.parse({ id: rawId, completed: rawCompleted })
  
  const sql = postgres(process.env.SUPABASE_DB_URL!)
  
  await sql`
    UPDATE action_items
    SET completed = ${completed}
    WHERE id = ${id}
  `
  
  await sql.end()
}
