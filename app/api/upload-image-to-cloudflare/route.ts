import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
})

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
        return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileExtension = file.name.split(".").pop()
    const key = `${uuidv4()}.${fileExtension}`

    const uploadParams = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    }

    await R2.send(new PutObjectCommand(uploadParams))

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ url: publicUrl })
}
