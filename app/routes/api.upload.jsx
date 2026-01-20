import { data } from "react-router";
import fs from "fs/promises";
import path from "path";

export const action = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return data({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

        await fs.writeFile(uploadPath, buffer);

        return data({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Upload error:", error);
        return data({ error: "Upload failed: " + error.message }, { status: 500 });
    }
};
