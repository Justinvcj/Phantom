'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleActionItem(id: string, completed: boolean) {
  const supabase = createClient()
  
  await supabase
    .from('action_items')
    .update({ completed })
    .eq('id', id)

  // Revalidate is nice, but we optimistic update on the client anyway
}
