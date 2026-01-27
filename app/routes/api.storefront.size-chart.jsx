import { data } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Public API endpoint for storefront via App Proxy
// GET: Fetch size chart template by shop and product ID
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  
  // Enable CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // Authenticate the app proxy request - this verifies the HMAC signature
    const { session } = await authenticate.public.appProxy(request);
    
    // Get shop from authenticated session or query param
    const shop = session?.shop || url.searchParams.get("shop");
    const productId = url.searchParams.get("productId");

    if (!shop || !productId) {
      return data(
        { error: "Missing required parameters: shop and productId", hasTemplate: false },
        { status: 400, headers }
      );
    }

    // Find the template assignment for this product
    const assignment = await prisma.productTemplateAssignment.findUnique({
      where: {
        shop_productId: {
          shop,
          productId,
        },
      },
      include: {
        template: true,
      },
    });

    if (!assignment || !assignment.template) {
      return data(
        { error: "No size chart template assigned to this product", hasTemplate: false },
        { status: 404, headers }
      );
    }

    const template = assignment.template;

    // Only return active templates
    if (!template.isActive) {
      return data(
        { error: "Size chart template is not active", hasTemplate: false },
        { status: 404, headers }
      );
    }

    return data(
      {
        hasTemplate: true,
        template: {
          id: template.id,
          name: template.name,
          gender: template.gender,
          category: template.category,
          columns: JSON.parse(template.columns),
          rows: JSON.parse(template.rows),
          guideImage: template.guideImage,
          measureDescription: template.measureDescription,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching size chart:", error);
    return data(
      { error: "Internal server error", hasTemplate: false },
      { status: 500, headers }
    );
  }
};

// Handle preflight CORS requests
export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  return data({ error: "Method not allowed" }, { status: 405 });
};
