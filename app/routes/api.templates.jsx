import { data } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// GET: List all templates for the shop
// POST: Create a new template
// DELETE: Delete template by ID (pass id in request body)
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const templates = await prisma.template.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  // Parse JSON fields for each template
  const parsedTemplates = templates.map((template) => ({
    ...template,
    columns: JSON.parse(template.columns),
    rows: JSON.parse(template.rows),
  }));

  return data({ templates: parsedTemplates });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const method = request.method;

  if (method === "POST") {
    const formData = await request.formData();
    const name = formData.get("name");
    const gender = formData.get("gender");
    const category = formData.get("category");
    const columns = formData.get("columns");
    const rows = formData.get("rows");
    const guideImage = formData.get("guideImage") || null;
    const measureDescription = formData.get("measureDescription") || null;

    if (!name || !gender || !category || !columns || !rows) {
      return data(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        shop,
        name,
        gender,
        category,
        columns,
        rows,
        guideImage,
        measureDescription,
        isActive: false,
      },
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
    const formData = await request.formData();
    const id = formData.get("id");

    if (!id) {
      return data({ error: "Template ID is required" }, { status: 400 });
    }

    // Verify template belongs to shop
    const template = await prisma.template.findFirst({
      where: { id, shop },
    });

    if (!template) {
      return data({ error: "Template not found" }, { status: 404 });
    }

    await prisma.template.delete({
      where: { id },
    });

    return data({ success: true, deletedId: id });
  }

  return data({ error: "Method not allowed" }, { status: 405 });
};
