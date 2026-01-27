import { data } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Public API endpoint for storefront via App Proxy
// GET: Fetch size chart button settings for a shop
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // Authenticate the app proxy request
    const { session } = await authenticate.public.appProxy(request);
    
    const shop = session?.shop || url.searchParams.get("shop");

    if (!shop) {
      return data(
        { error: "Missing shop parameter", settings: null },
        { status: 400, headers }
      );
    }

    // Get settings for this shop
    let settings = await prisma.sizeChartSettings.findUnique({
      where: { shop },
    });

    // Return default settings if none exist
    if (!settings) {
      settings = {
        buttonText: "Size Guide",
        buttonIcon: "ruler",
        buttonAlignment: "left",
        buttonTextColor: "#ffffff",
        buttonBgColor: "#111111",
        buttonBorderRadius: 6,
        buttonPaddingTop: 10,
        buttonPaddingBottom: 10,
        buttonPaddingLeft: 20,
        buttonPaddingRight: 20,
        buttonBorderStyle: "none",
        buttonBorderColor: "#111111",
        buttonBorderWidth: 1,
        buttonBorderTop: true,
        buttonBorderRight: true,
        buttonBorderBottom: true,
        buttonBorderLeft: true,
        tableDesign: "classic",
      };
    }

    return data({ settings }, { headers });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return data(
      { error: "Internal server error", settings: null },
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
