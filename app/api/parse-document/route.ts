import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  try {
    let text = ''

    if (name.endsWith('.pdf')) {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: new Uint8Array(buffer) })
      const result = await parser.getText()
      text = result.text
    } else if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      // Treat any other file as plain text (UTF-8)
      text = buffer.toString('utf-8')
    }

    return Response.json({ text: text.trim() })
  } catch (err) {
    console.error('[parse-document] error:', err)
    return Response.json({ error: 'Failed to parse file.' }, { status: 500 })
  }
}
