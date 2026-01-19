import { data } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// GET: Get single template by ID
export const loader = async ({ request, params }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const { id } = params;

    const template = await prisma.template.findFirst({
        where: { id, shop },
    });

    if (!template) {
        return data({ error: "Template not found" }, { status: 404 });
    }

    return data({
        template: {
            ...template,
            columns: JSON.parse(template.columns),
            rows: JSON.parse(template.rows),
        },
    });
};

// PUT: Update template
// DELETE: Delete template
export const action = async ({ request, params }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const { id } = params;
    const method = request.method;

    // Verify template belongs to shop
    const existingTemplate = await prisma.template.findFirst({
        where: { id, shop },
    });

    if (!existingTemplate) {
        return data({ error: "Template not found" }, { status: 404 });
    }

    if (method === "PUT") {
        const formData = await request.formData();

        const updateData = {};

        const name = formData.get("name");
        const gender = formData.get("gender");
        const category = formData.get("category");
        const columns = formData.get("columns");
        const rows = formData.get("rows");
        const guideImage = formData.get("guideImage");
        const measureDescription = formData.get("measureDescription");
        const isActive = formData.get("isActive");

        if (name) updateData.name = name;
        if (gender) updateData.gender = gender;
        if (category) updateData.category = category;
        if (columns) updateData.columns = columns;
        if (rows) updateData.rows = rows;
        if (guideImage !== null) updateData.guideImage = guideImage || null;
        if (measureDescription !== null) updateData.measureDescription = measureDescription || null;
        if (isActive !== null) updateData.isActive = isActive === "true";

        const template = await prisma.template.update({
            where: { id },
            data: updateData,
        });

        return data({
            success: true,
            template: {
                ...template,
                columns: JSON.parse(template.columns),
                rows: JSON.parse(template.rows),
            },
        });
    }

    if (method === "DELETE") {
        await prisma.template.delete({
            where: { id },
        });

        return data({ success: true, deletedId: id });
    }

    return data({ error: "Method not allowed" }, { status: 405 });
};
