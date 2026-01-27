import { data } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Public API endpoint for storefront via App Proxy
// GET: Fetch custom tailor template by shop and product ID
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

    // Find the tailor template assignment for this product
    const assignment = await prisma.tailorTemplateAssignment.findUnique({
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
      console.log(`No tailor assignment found for shop: ${shop}, productId: ${productId}`);
      return data(
        { error: "No custom order template assigned to this product", hasTemplate: false },
        { status: 404, headers }
      );
    }

    const template = assignment.template;
    console.log(`Found tailor template: ${template.name}, isActive: ${template.isActive}`);

    // Parse JSON fields
    const fields = template.fields ? JSON.parse(template.fields) : [];
    const fitPreferences = template.fitPreferences ? JSON.parse(template.fitPreferences) : null;
    const collarOptions = template.collarOptions ? JSON.parse(template.collarOptions) : null;
    const customFeatures = template.customFeatures ? JSON.parse(template.customFeatures) : null;

    return data(
      {
        hasTemplate: true,
        template: {
          id: template.id,
          name: template.name,
          gender: template.gender,
          clothingType: template.clothingType,
          fields: fields,
          fitPreferences: fitPreferences,
          collarOptions: collarOptions,
          enableStitchingNotes: template.enableStitchingNotes,
          customFeatures: customFeatures,
          isActive: template.isActive,
          price: template.price,
          currency: template.currency || "USD",
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching custom order template:", error);
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
