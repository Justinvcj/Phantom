'use server'

import { createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"

const ToggleActionItemSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean()
})

export async function toggleActionItem(rawId: string, rawCompleted: boolean) {
  const { id, completed } = ToggleActionItemSchema.parse({ id: rawId, completed: rawCompleted })
  const supabaseAdmin = createAdminClient()
  
  await supabaseAdmin
    .from('action_items')
    .update({ completed })
    .eq('id', id)
}
