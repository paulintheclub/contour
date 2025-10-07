"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, X } from "lucide-react"
import Image from "next/image"

interface Props {
    label: string
    value: string | string[]
    multiple?: boolean
    mandatory?: boolean
    onChange: (value: string | string[]) => void
}

export function ImageUploadField({ label, value, onChange, mandatory = false, multiple = false }: Props) {
    const [isUploading, setUploading] = useState(false)
    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload-image-to-cloudflare", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            return data?.url || null
        } catch (e) {
            console.error("Upload failed", e)
            return null
        }
    }

    const deleteImage = async (url: string) => {
        try {
            const res = await fetch(`/api/delete-image-from-cloudflare?url=${encodeURIComponent(url)}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete image")

            if (multiple && Array.isArray(value)) {
                onChange(value.filter((v) => v !== url))
            } else {
                onChange("")
            }
        } catch (e) {
            console.error("Delete failed", e)
        }
    }

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return
            setUploading(true)

            const urls: string[] = []

            for (const file of acceptedFiles) {
                const uploadedUrl = await uploadFile(file)
                if (uploadedUrl) {
                    urls.push(uploadedUrl)
                }
            }

            if (multiple) {
                const current = Array.isArray(value) ? value : []
                onChange([...current, ...urls])
            } else {
                onChange(urls[0] || "")
            }

            setUploading(false)
        },
        [value, multiple, onChange]
    )

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple,
    })

    const images = Array.isArray(value) ? value : value ? [value] : []

    const renderImages = () => {
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {images.map((url, idx) => (
                    <div key={idx} className="relative w-32 h-32 rounded overflow-hidden border">
                        <Image
                            src={url}
                            alt={`uploaded-${idx}`}
                            fill
                            className="object-cover"
                            sizes="128px"
                        />
                        <button
                            type="button"
                            onClick={() => deleteImage(url)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100 text-red-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            {mandatory && <span className="text-red-500 ml-1">*</span>}

            {images.length > 0 && renderImages()}

            {(multiple || images.length === 0) && (
                <div
                    {...getRootProps()}
                    className="mt-2 border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-100"
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <Loader2 className="animate-spin mx-auto text-gray-500" />
                    ) : (
                        <p>Drag and drop image</p>
                    )}
                </div>
            )}
        </div>
    )
}
