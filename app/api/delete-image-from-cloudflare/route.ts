// app/api/delete-image-from-cloudflare/route.ts
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
})

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
        return NextResponse.json({ error: "Missing URL" }, { status: 400 })
    }

    try {
        const publicUrlPrefix = process.env.CLOUDFLARE_R2_PUBLIC_URL!
        const key = imageUrl.replace(publicUrlPrefix, "").replace(/^\/+/, "")

        const command = new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
            Key: key,
        })

        await R2.send(command)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Error deleting image from R2:", err)
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }
}
