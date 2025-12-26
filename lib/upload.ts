import { NextRequest } from "next/server"
import { put, del } from "@vercel/blob"

export interface UploadOptions {
  maxFiles?: number
  maxSizePerFile?: number // in bytes
  allowedTypes?: string[]
  folder?: string
}

export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxFiles: 10,
  maxSizePerFile: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  folder: 'products'
}

// Hardcoded Vercel Blob token for production (temporary fix)
const BLOB_TOKEN = "vercel_blob_rw_RYvcQp6FMT1XQpxN_PKi3fRozRw6JZvkRg1d9OJ0aVONPjZ"

async function uploadSingleFile(file: File, folder: string): Promise<UploadResult> {
  // Direct Vercel Blob upload with hardcoded token
  const extension = file.name.split(".").pop() || "jpg"
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const filename = `${folder}/${timestamp}-${random}.${extension}`

  const blob = await put(filename, file, {
    access: "public",
    token: BLOB_TOKEN,
  })

  console.log(`Uploaded to Vercel Blob: ${blob.url}`)

  return {
    url: blob.url,
    filename,
    size: file.size,
    type: file.type,
  }
}

// Old dynamic provider code (commented out for reference)
// import { getStorageProvider } from './storage/providers'
// async function uploadSingleFile(file: File, folder: string): Promise<UploadResult> {
//   const storageProvider = getStorageProvider()
//   console.log(`Using storage provider: ${storageProvider.name}`)
//   return storageProvider.upload(file, folder)
// }

export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (files.length > (opts.maxFiles || 10)) {
    throw new Error(`Maximum ${opts.maxFiles} files allowed`)
  }

  const uploadPromises = files.map(async (file) => {
    // Validate file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`)
    }

    // Validate file size
    if (opts.maxSizePerFile && file.size > opts.maxSizePerFile) {
      throw new Error(`File size ${file.size} bytes exceeds maximum ${opts.maxSizePerFile} bytes`)
    }

    // Upload directly to Vercel Blob
    return uploadSingleFile(file, opts.folder || 'products')
  })

  return Promise.all(uploadPromises)
}

export async function deleteFile(url: string): Promise<boolean> {
  try {
    // Direct Vercel Blob delete with hardcoded token
    await del(url, {
      token: BLOB_TOKEN,
    })
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Old dynamic provider code (commented out for reference)
// export async function deleteFile(url: string): Promise<boolean> {
//   try {
//     const storageProvider = getStorageProvider()
//     return storageProvider.delete(url)
//   } catch (error) {
//     console.error('Error deleting file:', error)
//     return false
//   }
// }

export function getFileFromFormData(formData: FormData, fieldName: string): File[] {
  const files: File[] = []
  const entries = formData.getAll(fieldName)

  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry)
    }
  }

  return files
}

export async function handleImageUpload(request: NextRequest): Promise<UploadResult[]> {
  try {
    const formData = await request.formData()
    const files = getFileFromFormData(formData, 'images')

    if (files.length === 0) {
      throw new Error('No files provided')
    }

    const uploadResults = await uploadFiles(files, {
      maxFiles: 10,
      maxSizePerFile: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      folder: 'products'
    })

    return uploadResults
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}