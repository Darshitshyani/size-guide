import { data } from "react-router";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const action = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return data({ error: "No file uploaded" }, { status: 400 });
        }

        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;
        const bucketName = process.env.AWS_S3_BUCKET_NAME;

        if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
            console.error("Missing AWS configuration");
            return data({ error: "Server configuration error" }, { status: 500 });
        }

        const s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename and add timestamp
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const key = `images/uploads/${filename}`; // Organize in folder

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            // ACL: "public-read", // Optional: depends on bucket settings. Many buckets block ACLs now.
        });

        await s3Client.send(command);

        // Construct Public URL
        const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

        return data({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return data({ error: "Upload failed: " + error.message }, { status: 500 });
    }
};
