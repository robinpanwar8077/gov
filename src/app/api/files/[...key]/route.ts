import { s3Client, BUCKET_NAME } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string[] }> }
) {
    const session = await getSession();
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { key } = await params;
    const s3Key = key.join("/");

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
        });

        const response = await s3Client.send(command);

        // Streams the data back to the client
        if (response.Body) {
            // Convert ReadableStream (S3) to Response body
            const stream = response.Body as any;
            
            // Set headers for preview/download
            const headers = new Headers();
            if (response.ContentType) headers.set("Content-Type", response.ContentType);
            if (response.ContentLength) headers.set("Content-Length", response.ContentLength.toString());
            
            // Allow browser to preview PDF/Images by not forcing attachment
            headers.set("Content-Disposition", `inline; filename="${s3Key.split('/').pop()}"`);
            headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

            return new Response(stream, { headers });
        }

        return new Response("File not found", { status: 404 });
    } catch (error) {
        console.error("S3 Get Error:", error);
        return new Response("Error fetching file", { status: 500 });
    }
}
