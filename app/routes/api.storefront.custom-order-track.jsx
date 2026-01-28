import db from "../db.server";

// App Proxy endpoint to track custom orders when added to cart
export const action = async ({ request }) => {
  // Handle CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return new Response(JSON.stringify({ error: "Shop parameter required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const body = await request.json();
    const {
      productId,
      productTitle,
      productImage,
      variantId,
      variantTitle,
      measurements,
      options,
    } = body;

    if (!productId || !measurements) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Generate a temporary order ID (will be updated when actual order is placed)
    // Format: PENDING-{timestamp}-{random}
    const tempOrderId = `PENDING-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tempLineItemId = `ITEM-${Date.now()}`;

    // Create the custom order record with pending status
    const customOrder = await db.customOrderStatus.create({
      data: {
        shop,
        orderId: tempOrderId,
        orderName: `Pending Order`,
        lineItemId: tempLineItemId,
        productId: String(productId),
        productTitle: productTitle || 'Custom Order',
        productImage: productImage || null,
        variantTitle: variantTitle || null,
        measurements: JSON.stringify(measurements),
        options: options ? JSON.stringify(options) : null,
        status: 'pending',
      },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      id: customOrder.id,
      message: "Custom order tracked successfully" 
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error tracking custom order:", error);
    return new Response(JSON.stringify({ error: "Failed to track custom order" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const loader = async () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
