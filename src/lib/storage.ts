import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";

const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "minioadmin";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "minioadminpassword";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "govpronet";
const S3_REGION = process.env.S3_REGION || "us-east-1";

// Initialize S3 Client
export const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true, // Needed for MinIO
});

export const BUCKET_NAME = S3_BUCKET_NAME;

// Helper to ensure bucket exists
async function ensureBucketExists() {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
    } catch (error: any) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            console.log(`Bucket ${S3_BUCKET_NAME} not found. Creating...`);
            try {
                await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET_NAME, }));
                console.log(`✅ Bucket ${S3_BUCKET_NAME} created.`);
            } catch (createError) {
                console.error("Failed to create bucket:", createError);
            }
        } else {
            console.error("Error checking bucket:", error);
        }
    }
}

/**
 * Uploads a file to S3/MinIO and returns the public URL.
 * @param file The standard Web API File object
 * @param folder Optional folder path (e.g., "kyc/documents")
 */
export async function uploadFile(file: File, folder: string = "uploads"): Promise<string> {
    // Ensure bucket exists before upload
    await ensureBucketExists();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique file key
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    try {
        await s3Client.send(command);
        console.log(`✅ Uploaded ${key} to ${S3_BUCKET_NAME}`);

        // Construct Public URL (Assuming MinIO bucket is public)
        // Note: For localhost, exact path depends on how you access it.
        // If accessed from browser outside docker: localhost:9000
        // If accessed internally: minio:9000
        // We generally return the public browser-accessible URL.

        // Construct Port-neutral Proxy URL
        // We return a relative API URL that goes through our server proxy.
        // This solves localhost vs public-domain issues and handles auth.
        return `/api/files/${key}`;

    } catch (error) {
        console.error("❌ S3 Upload Error:", error);
        throw new Error("Failed to upload file to storage.");
    }
}
