import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  safeSubmissionAttachmentName,
  validateSubmissionAttachmentFile,
} from '@/lib/submission-attachment'

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const validationError = validateSubmissionAttachmentFile(file)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const db = createServerClient()
  const safeName = safeSubmissionAttachmentName(file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await db.storage
    .from('submission-attachments')
    .upload(safeName, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = db.storage.from('submission-attachments').getPublicUrl(data.path)

  return NextResponse.json({
    url: publicUrl,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
  })
}
