import { useState, useRef, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import prisma from "../../db.server";

// Image URLs
const ICONS_BASE_URL = "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/icons";
const GUIDE_IMAGES_BASE_URL = "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/guideimages";
const FEMALE_GUIDE_IMAGES_BASE_URL = "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/guideimages/female";

// Icon URLs
const Malepents = `${ICONS_BASE_URL}/male+pents.png`;
const Maleshirts = `${ICONS_BASE_URL}/male+shirts.png`;
const Maleshoes = `${ICONS_BASE_URL}/male+shoes.png`;
const MaleUnderWare = `${ICONS_BASE_URL}/male+underwear.png`;
const femalenderWare = `${ICONS_BASE_URL}/female+underwear.png`;
const femalejeans = `${ICONS_BASE_URL}/female+jeans.png`;
const femalekurti = `${ICONS_BASE_URL}/female+kurti.png`;
const femaleshoes = `${ICONS_BASE_URL}/female+shoes.png`;
const femaleskit = `${ICONS_BASE_URL}/female+skits.png`;
const femaletshirt = `${ICONS_BASE_URL}/female+t+shirt.png`;
const femalesuit = `${ICONS_BASE_URL}/female+suit.png`;
const saree = `${ICONS_BASE_URL}/sareee.png`;
const customIcon = `${ICONS_BASE_URL}/male+custom.png`;
const femaledress = `${ICONS_BASE_URL}/+female+dress.png`;
const bra = `${ICONS_BASE_URL}/bra.png`;
const maleIcon = `${ICONS_BASE_URL}/male.png`;
const femaleIcon = `${ICONS_BASE_URL}/female.png`;
const tshirt = `${ICONS_BASE_URL}/t+shirt.png`;
const kurta = `${ICONS_BASE_URL}/kurta-man.png`;
const jeans = `${ICONS_BASE_URL}/jeans.png`;
const suit = `${ICONS_BASE_URL}/suit.png`;

// Female guide images
const brafemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/brafemale.png`;
const dressfemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/dress.png`;
const jeansfemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/pentsfemlae.png`;
const kurtafemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/kurtifemale.png`;
const underwarefemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/underwarefemale.png`;
const shoesfemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/heelfemale.png`;
const skitfemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/skit.png`;
const suitfemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/salwarfemale.png`;
const tshirtfemale = `${FEMALE_GUIDE_IMAGES_BASE_URL}/tshirtfemale.png`;


// Male guide images
const maleGuideImages = {
  pants: `${GUIDE_IMAGES_BASE_URL}/pentsSiz.jpeg`,
  shirts: `${GUIDE_IMAGES_BASE_URL}/shirtSiz.jpeg`,
  tshirt: `${GUIDE_IMAGES_BASE_URL}/tshirtSIz.jpeg`,
  jeans: `${GUIDE_IMAGES_BASE_URL}/jensSiz.jpeg`,
  kurta: `${GUIDE_IMAGES_BASE_URL}/surtaSiz.jpeg`,
  suit: `${GUIDE_IMAGES_BASE_URL}/suitSiz.jpeg`,
  underwear: `${GUIDE_IMAGES_BASE_URL}/underwareSiz.jpeg`,
  shoes: `${GUIDE_IMAGES_BASE_URL}/shoesSiz.jpeg`,
};

// Female guide images
const femaleGuideImages = {
  top: tshirtfemale,
  dress: dressfemale,
  jeans: jeansfemale,
  skirt: skitfemale,
  saree: null,
  kurti: kurtafemale,
  salwarSuit: suitfemale,
  bra: brafemale,
  underwear: underwarefemale,
  shoes: shoesfemale,
};

// Categories data
const categories = {
  male: [
    { id: "pants", label: "Pants", icon: Malepents, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }, { label: "Inseam (in)", key: "inseam" }], rows: [{ size: "S", waist: 28, hip: 35, inseam: 33 }, { size: "M", waist: 30, hip: 37, inseam: 33 }, { size: "L", waist: 32, hip: 39, inseam: 33 }, { size: "XL", waist: 34, hip: 41, inseam: 33 }, { size: "XXL", waist: 36, hip: 43, inseam: 33 }] }, howToMeasure: [{ title: "Waist", description: "Wrap the tape around the narrowest part of your waist." }, { title: "Hip", description: "Measure around the widest part of your hips." }, { title: "Inseam", description: "Measure from the crotch seam down to the bottom of the leg." }] },
    { id: "shirts", label: "Shirts", icon: Maleshirts, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Chest (in)", key: "chest" }, { label: "Shoulder (in)", key: "shoulder" }, { label: "Length (in)", key: "length" }], rows: [{ size: "S", chest: 38, shoulder: 17, length: 27 }, { size: "M", chest: 40, shoulder: 17.5, length: 28 }, { size: "L", chest: 42, shoulder: 18, length: 29 }, { size: "XL", chest: 44, shoulder: 18.5, length: 30 }, { size: "XXL", chest: 46, shoulder: 19, length: 31 }] }, howToMeasure: [{ title: "Chest", description: "Measure around the fullest part of your chest." }, { title: "Shoulder", description: "Measure from the tip of one shoulder to the other." }, { title: "Length", description: "Measure from the highest shoulder point down." }] },
    { id: "tshirt", label: "T-Shirt", icon: tshirt, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Chest (in)", key: "chest" }, { label: "Length (in)", key: "length" }], rows: [{ size: "S", chest: 38, length: 27 }, { size: "M", chest: 40, length: 28 }, { size: "L", chest: 42, length: 29 }, { size: "XL", chest: 44, length: 30 }, { size: "XXL", chest: 46, length: 31 }] }, howToMeasure: [{ title: "Chest", description: "Measure around the fullest part of your chest." }, { title: "Length", description: "Measure from the highest shoulder point down." }] },
    { id: "jeans", label: "Jeans", icon: jeans, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }, { label: "Inseam (in)", key: "inseam" }], rows: [{ size: "S", waist: 28, hip: 35, inseam: 33 }, { size: "M", waist: 30, hip: 37, inseam: 33 }, { size: "L", waist: 32, hip: 39, inseam: 33 }, { size: "XL", waist: 34, hip: 41, inseam: 33 }, { size: "XXL", waist: 36, hip: 43, inseam: 33 }] }, howToMeasure: [{ title: "Waist", description: "Wrap the tape around the narrowest part of your waist." }, { title: "Hip", description: "Measure around the widest part of your hips." }, { title: "Inseam", description: "Measure from the crotch seam down to the bottom of the leg." }] },
    { id: "kurta", label: "Kurta", icon: kurta, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Chest (in)", key: "chest" }, { label: "Shoulder (in)", key: "shoulder" }, { label: "Length (in)", key: "length" }], rows: [{ size: "S", chest: 38, shoulder: 17, length: 40 }, { size: "M", chest: 40, shoulder: 17.5, length: 41 }, { size: "L", chest: 42, shoulder: 18, length: 42 }, { size: "XL", chest: 44, shoulder: 18.5, length: 43 }, { size: "XXL", chest: 46, shoulder: 19, length: 44 }] }, howToMeasure: [{ title: "Chest", description: "Measure around the fullest part of your chest." }, { title: "Shoulder", description: "Measure from the tip of one shoulder to the other." }, { title: "Length", description: "Measure from the highest shoulder point down." }] },
    { id: "suit", label: "Suit", icon: suit, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Chest (in)", key: "chest" }, { label: "Waist (in)", key: "waist" }, { label: "Shoulder (in)", key: "shoulder" }, { label: "Length (in)", key: "length" }], rows: [{ size: "S", chest: 38, waist: 30, shoulder: 17, length: 40 }, { size: "M", chest: 40, waist: 32, shoulder: 17.5, length: 41 }, { size: "L", chest: 42, waist: 34, shoulder: 18, length: 42 }, { size: "XL", chest: 44, waist: 36, shoulder: 18.5, length: 43 }, { size: "XXL", chest: 46, waist: 38, shoulder: 19, length: 44 }] }, howToMeasure: [{ title: "Chest", description: "Measure around the fullest part of your chest." }, { title: "Waist", description: "Wrap the tape around the narrowest part of your waist." }, { title: "Shoulder", description: "Measure from the tip of one shoulder to the other." }, { title: "Length", description: "Measure from the highest shoulder point down." }] },
    { id: "underwear", label: "Underwear", icon: MaleUnderWare, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Waist (in)", key: "waist" }], rows: [{ size: "S", waist: 28 }, { size: "M", waist: 30 }, { size: "L", waist: 32 }, { size: "XL", waist: 34 }, { size: "XXL", waist: 36 }] }, howToMeasure: [{ title: "Waist", description: "Wrap the tape around the narrowest part of your waist." }] },
    { id: "shoes", label: "Shoes", icon: Maleshoes, sizeChart: { columns: [{ label: "Size (India)", key: "size" }, { label: "Foot Length (cm)", key: "length" }], rows: [{ size: 6, length: 24 }, { size: 7, length: 25 }, { size: 8, length: 26 }, { size: 9, length: 27 }, { size: 10, length: 28 }, { size: 11, length: 29 }] }, howToMeasure: [{ title: "Foot Length", description: "Measure from the tip of the longest toe to the back of the heel." }] },
    { id: "custom", label: "Custom", icon: customIcon, sizeChart: null },
  ],
  female: [
    { id: "top", label: "Top / T-Shirt", icon: femaletshirt, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Chest (in)", key: "chest" }], rows: [{ size: "S", chest: 38 }, { size: "M", chest: 40 }, { size: "L", chest: 42 }, { size: "XL", chest: 44 }, { size: "XXL", chest: 46 }] }, howToMeasure: [{ title: "Chest", description: "Measure around the fullest part of your chest." }] },
    { id: "dress", label: "Dress", icon: femaledress, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Bust (in)", key: "bust" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }], rows: [{ size: "S", bust: 34, waist: 27, hip: 36 }, { size: "M", bust: 36, waist: 29, hip: 38 }, { size: "L", bust: 38, waist: 31, hip: 40 }, { size: "XL", bust: 40, waist: 33, hip: 42 }, { size: "XXL", bust: 42, waist: 35, hip: 44 }] }, howToMeasure: [{ title: "Bust", description: "Measure around the fullest part of your bust." }, { title: "Waist", description: "Measure around the narrowest part of your waist." }, { title: "Hip", description: "Measure around the widest part of your hips." }] },
    { id: "jeans", label: "Jeans", icon: femalejeans, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }, { label: "Inseam (in)", key: "inseam" }], rows: [{ size: 28, waist: 28, hip: 35, inseam: 32 }, { size: 30, waist: 30, hip: 37, inseam: 32 }, { size: 32, waist: 32, hip: 39, inseam: 32 }, { size: 34, waist: 34, hip: 41, inseam: 32 }, { size: 36, waist: 36, hip: 43, inseam: 32 }] }, howToMeasure: [{ title: "Waist", description: "Measure around the narrowest part of your waist." }, { title: "Hip", description: "Measure around the widest part of your hips." }, { title: "Inseam", description: "Measure from the crotch seam down to the bottom of the leg." }] },
    { id: "skirt", label: "Skirt", icon: femaleskit, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }], rows: [{ size: "S", waist: 28, hip: 36 }, { size: "M", waist: 30, hip: 38 }, { size: "L", waist: 32, hip: 40 }, { size: "XL", waist: 34, hip: 42 }, { size: "XXL", waist: 36, hip: 44 }] }, howToMeasure: [{ title: "Waist", description: "Measure around the narrowest part of your waist." }, { title: "Hip", description: "Measure around the widest part of your hips." }] },
    { id: "kurti", label: "Kurti", icon: femalekurti, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Bust (in)", key: "bust" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }], rows: [{ size: "S", bust: 34, waist: 28, hip: 36 }, { size: "M", bust: 36, waist: 30, hip: 38 }, { size: "L", bust: 38, waist: 32, hip: 40 }, { size: "XL", bust: 40, waist: 34, hip: 42 }, { size: "XXL", bust: 42, waist: 36, hip: 44 }] }, howToMeasure: [{ title: "Bust", description: "Measure around the fullest part of your bust." }, { title: "Waist", description: "Measure around the narrowest part of your waist." }] },
    { id: "salwarSuit", label: "Salwar Suit", icon: femalesuit, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Bust (in)", key: "bust" }, { label: "Waist (in)", key: "waist" }, { label: "Hip (in)", key: "hip" }, { label: "Top Length (in)", key: "topLength" }], rows: [{ size: "S", bust: 34, waist: 28, hip: 36, topLength: 41 }, { size: "M", bust: 36, waist: 30, hip: 38, topLength: 42 }, { size: "L", bust: 38, waist: 32, hip: 40, topLength: 43 }, { size: "XL", bust: 40, waist: 34, hip: 42, topLength: 44 }, { size: "XXL", bust: 42, waist: 36, hip: 44, topLength: 45 }] }, howToMeasure: [{ title: "Bust", description: "Measure around the fullest part of your bust." }, { title: "Waist", description: "Measure around the narrowest part of your waist." }] },
    { id: "bra", label: "Bra", icon: bra, sizeChart: { columns: [{ label: "Band Size", key: "band" }, { label: "Cup Size", key: "cup" }, { label: "Bust (in)", key: "bust" }], rows: [{ band: 32, cup: "B", bust: 34 }, { band: 34, cup: "B", bust: 36 }, { band: 36, cup: "C", bust: 38 }, { band: 38, cup: "C", bust: 40 }] }, howToMeasure: [{ title: "Band Size", description: "Measure around the fullest part of your bust." }, { title: "Cup Size", description: "Measure around the narrowest part of your waist." }] },
    { id: "underwear", label: "Underwear", icon: femalenderWare, sizeChart: { columns: [{ label: "Size", key: "size" }, { label: "Waist (in)", key: "waist" }], rows: [{ size: "S", waist: 28 }, { size: "M", waist: 30 }, { size: "L", waist: 32 }, { size: "XL", waist: 34 }, { size: "XXL", waist: 36 }] }, howToMeasure: [{ title: "Waist", description: "Measure around the narrowest part of your waist." }] },
    { id: "shoes", label: "Shoes", icon: femaleshoes, sizeChart: { columns: [{ label: "Size (India)", key: "size" }, { label: "Foot Length (cm)", key: "length" }], rows: [{ size: 4, length: 22 }, { size: 5, length: 23 }, { size: 6, length: 24 }, { size: 7, length: 25 }, { size: 8, length: 26 }] }, howToMeasure: [{ title: "Foot Length", description: "Measure from the tip of the longest toe to the back of the heel." }] },
    { id: "custom", label: "Custom", icon: customIcon, sizeChart: null },
  ],
};

// Loader: Fetch templates from database and products from Shopify
export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Fetch templates from database
  const dbTemplates = await prisma.template.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  // Parse JSON fields and format for frontend
  const templates = dbTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    dateCreated: new Date(template.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    gender: template.gender,
    category: template.category,
    status: template.isActive ? "Active" : "Inactive",
    isActive: template.isActive,
    columns: JSON.parse(template.columns),
    rows: JSON.parse(template.rows),
    guideImage: template.guideImage,
    measureDescription: template.measureDescription,
  }));

  // Fetch TailorTemplates (Custom Templates from Measurement Template Builder)
  const dbTailorTemplates = await prisma.tailorTemplate.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  // Parse JSON fields and format for frontend
  const customTemplates = dbTailorTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    dateCreated: new Date(template.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    gender: template.gender,
    clothingType: template.clothingType,
    fields: typeof template.fields === "string" ? JSON.parse(template.fields) : template.fields,
    fitPreferences: template.fitPreferences ? JSON.parse(template.fitPreferences) : null,
    collarOptions: template.collarOptions ? JSON.parse(template.collarOptions) : null,
    status: template.isActive ? "Active" : "Inactive",
    isActive: template.isActive,
    enableStitchingNotes: template.enableStitchingNotes,
  }));


  // Fetch products from Shopify
  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }`
  );

  const responseJson = await response.json();
  const productEdges = responseJson.data?.products?.edges || [];

  // Fetch existing product assignments (Table Charts)
  const assignments = await prisma.productTemplateAssignment.findMany({
    where: { shop },
    include: { template: { select: { id: true, name: true } } },
  });

  // Fetch existing tailor template assignments (Custom Templates)
  const customAssignments = await prisma.tailorTemplateAssignment.findMany({
    where: { shop },
    include: { template: { select: { id: true, name: true } } },
  });

  // Create a map of productId -> assignment info
  const assignmentMap = {};
  assignments.forEach((a) => {
    assignmentMap[a.productId] = {
      templateId: a.templateId,
      templateName: a.template.name,
    };
  });

  // Create map for custom assignments
  const customAssignmentMap = {};
  customAssignments.forEach((a) => {
    customAssignmentMap[a.productId] = {
      templateId: a.templateId,
      templateName: a.template.name,
    };
  });

  const products = productEdges.map((edge) => {
    const productId = edge.node.id.split("/").pop() || "";
    const assignment = assignmentMap[productId];
    const customAssignment = customAssignmentMap[productId];
    return {
      id: productId,
      name: edge.node.title,
      productId: productId,
      image: edge.node.featuredImage?.url || "placeholder",
      assignedTemplateId: assignment?.templateId || null,
      assignedTemplateName: assignment?.templateName || null,
      assignedCustomTemplateId: customAssignment?.templateId || null,
      assignedCustomTemplateName: customAssignment?.templateName || null,
    };
  });

  return { templates, customTemplates, products };
};

// Action: Handle create, update, delete operations
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name");
    const gender = formData.get("gender");
    const category = formData.get("category");
    const columns = formData.get("columns");
    const rows = formData.get("rows");
    const guideImage = formData.get("guideImage") || null;
    const measureDescription = formData.get("measureDescription") || null;

    if (!name || !gender || !category || !columns || !rows) {
      return { error: "Missing required fields" };
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

    return { success: true, template };
  }

  if (intent === "update") {
    const id = formData.get("id");
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

    return { success: true, template };
  }

  if (intent === "delete") {
    const id = formData.get("id");

    await prisma.template.delete({
      where: { id },
    });

    return { success: true, deletedId: id };
  }

  if (intent === "toggleStatus") {
    const id = formData.get("id");
    const isActive = formData.get("isActive") === "true";
    const templateType = formData.get("templateType") || "table";

    if (templateType === "custom") {
      await prisma.tailorTemplate.update({
        where: { id },
        data: { isActive },
      });
    } else {
      await prisma.template.update({
        where: { id },
        data: { isActive },
      });
    }

    return { success: true, templateId: id, templateType, isActive };
  }

  if (intent === "assignProducts") {
    const templateId = formData.get("templateId");
    const templateType = formData.get("templateType") || "table"; // "table" or "custom"
    const productIds = JSON.parse(formData.get("productIds") || "[]");

    const modelName = templateType === "custom" ? "tailorTemplateAssignment" : "productTemplateAssignment";

    // 1. Unassign products that were assigned to THIS template but are NOT in the new list (Uncheck action)
    await prisma[modelName].deleteMany({
      where: {
        shop,
        templateId,
        productId: { notIn: productIds },
      },
    });

    // 2. Clear old assignments for the products in the new list (Re-assign/Steal action)
    // This ensures a product only has ONE template of this type
    await prisma[modelName].deleteMany({
      where: {
        shop,
        productId: { in: productIds },
      },
    });

    // Create new assignments
    const assignments = productIds.map((productId) => ({
      shop,
      productId,
      templateId,
    }));

    if (assignments.length > 0) {
      await prisma[modelName].createMany({
        data: assignments,
      });
    }

    return { success: true, assignedCount: productIds.length, templateId };
  }

  if (intent === "deleteCustomTemplate") {
    const id = formData.get("id");

    await prisma.tailorTemplate.delete({
      where: { id },
    });

    return { success: true, deletedCustomTemplateId: id };
  }

  if (intent === "updateCustomTemplate") {
    const id = formData.get("id");
    const name = formData.get("name");
    const fields = formData.get("fields");
    const fitPreferences = formData.get("fitPreferences");
    const collarOptions = formData.get("collarOptions");
    const enableStitchingNotes = formData.get("enableStitchingNotes") === "true";

    const updatedTemplate = await prisma.tailorTemplate.update({
      where: { id },
      data: {
        name,
        fields,
        fitPreferences: fitPreferences || null,
        collarOptions: collarOptions || null,
        enableStitchingNotes,
      },
    });

    return { success: true, updatedCustomTemplate: updatedTemplate };
  }

  return { error: "Invalid intent" };
};

export default function Templates() {
  const { templates: initialTemplates, customTemplates: initialCustomTemplates, products: shopifyProducts } = useLoaderData();
  const fetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [customTemplates, setCustomTemplates] = useState(initialCustomTemplates || []);
  const [activeTab, setActiveTab] = useState("Table Templates");
  const [templateSearch, setTemplateSearch] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewModalTemplate, setViewModalTemplate] = useState(null);
  const [assignModalTemplate, setAssignModalTemplate] = useState(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [initialSelectedProducts, setInitialSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalMainTab, setModalMainTab] = useState("Table Chart");
  const [modalSubTab, setModalSubTab] = useState("Details");
  const [modalUnit, setModalUnit] = useState("In");
  const filtersModalRef = useRef(null);

  // Create Template Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState("male");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartName, setChartName] = useState("");
  const [nameError, setNameError] = useState("");
  const [columnError, setColumnError] = useState("");
  const [chartColumns, setChartColumns] = useState([]);
  const [chartRows, setChartRows] = useState([]);
  const [guideImage, setGuideImage] = useState(null);
  const [pendingGuideImage, setPendingGuideImage] = useState(null);
  const [measureDescription, setMeasureDescription] = useState("");
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);
  const [editingColumnKey, setEditingColumnKey] = useState(null);
  const [editingColumnName, setEditingColumnName] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSubTab, setPreviewSubTab] = useState("Details");
  const [previewUnit, setPreviewUnit] = useState("In");
  const descriptionTextareaRef = useRef(null);
  const descriptionContentRef = useRef("");
  const [isSaving, setIsSaving] = useState(false);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [initialFormState, setInitialFormState] = useState(null);

  // Delete confirmation state
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState(null);

  // Custom Template (TailorTemplate) modal states
  const [viewCustomTemplateModal, setViewCustomTemplateModal] = useState(null);
  const [deleteCustomTemplateConfirm, setDeleteCustomTemplateConfirm] = useState(null);
  const [customTemplateViewTab, setCustomTemplateViewTab] = useState("details"); // "details" or "howto"
  const [customTemplateInfoField, setCustomTemplateInfoField] = useState(null); // Field for info modal in custom template view

  // Edit Custom Template modal state
  const [editCustomTemplateModal, setEditCustomTemplateModal] = useState(null); // Template being edited
  const [editCustomTemplateName, setEditCustomTemplateName] = useState("");
  const [editCustomTemplateFields, setEditCustomTemplateFields] = useState([]);
  const [editCustomTemplateFitPrefs, setEditCustomTemplateFitPrefs] = useState([]);
  const [editCustomTemplateCollars, setEditCustomTemplateCollars] = useState([]);
  const [editEnableFitPrefs, setEditEnableFitPrefs] = useState(false);
  const [editEnableStitchingNotes, setEditEnableStitchingNotes] = useState(false);
  const [editEnableCollars, setEditEnableCollars] = useState(false);

  // Edit Field Modal state (within Edit Custom Template)
  const [editFieldModal, setEditFieldModal] = useState(null); // { index, field } being edited
  const [editFieldModalFile, setEditFieldModalFile] = useState(null); // Pending file upload
  const [originalEditFieldModalFile, setOriginalEditFieldModalFile] = useState(null); // Store original file state when modal opens
  const [showEditTemplateDiscardWarning, setShowEditTemplateDiscardWarning] = useState(false);
  const [showEditFieldDiscardWarning, setShowEditFieldDiscardWarning] = useState(false);
  const [deleteFieldConfirm, setDeleteFieldConfirm] = useState(null); // { index, field } for field deletion confirmation
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [reassignmentConflicts, setReassignmentConflicts] = useState(null); // Array of products with conflicts

  // Update templates when fetcher returns data
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.template) {
      // New template created - add to list
      const newTemplate = fetcher.data.template;
      const formattedTemplate = {
        id: newTemplate.id,
        name: newTemplate.name,
        dateCreated: new Date(newTemplate.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        gender: newTemplate.gender,
        category: newTemplate.category,
        status: newTemplate.isActive ? "Active" : "Inactive",
        isActive: newTemplate.isActive,
        columns: typeof newTemplate.columns === 'string' ? JSON.parse(newTemplate.columns) : newTemplate.columns,
        rows: typeof newTemplate.rows === 'string' ? JSON.parse(newTemplate.rows) : newTemplate.rows,
        guideImage: newTemplate.guideImage,
        measureDescription: newTemplate.measureDescription,
      };

      setTemplates(prev => {
        if (prev.some(t => t.id === formattedTemplate.id)) {
          // Update existing template
          return prev.map(t => t.id === formattedTemplate.id ? formattedTemplate : t);
        }
        // Add new template
        return [formattedTemplate, ...prev];
      });
      handleCloseCreateModal();
      setIsSaving(false);
    } else if (fetcher.data?.success && fetcher.data?.deletedId) {
      // Template deleted - remove from list
      setTemplates(prev => prev.filter(t => t.id !== fetcher.data.deletedId));
      setDeleteConfirmTemplate(null);
    } else if (fetcher.data?.success && fetcher.data?.templateId && fetcher.data?.templateType) {
      // Template status toggled - update in list
      const { templateId, templateType, isActive } = fetcher.data;
      if (templateType === "custom") {
        setCustomTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, isActive, status: isActive ? "Active" : "Inactive" } : t
        ));
      } else {
        setTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, isActive, status: isActive ? "Active" : "Inactive" } : t
        ));
      }
    } else if (fetcher.data?.success && fetcher.data?.assignedCount !== undefined) {
      // Products assigned - close modal and show success
      handleCloseAssignModal();
    } else if (fetcher.data?.success && fetcher.data?.deletedCustomTemplateId) {
      // Custom template deleted - remove from list
      setCustomTemplates(prev => prev.filter(t => t.id !== fetcher.data.deletedCustomTemplateId));
      setDeleteCustomTemplateConfirm(null);
    } else if (fetcher.data?.success && fetcher.data?.updatedCustomTemplate) {
      // Custom template updated - update in list
      const updated = fetcher.data.updatedCustomTemplate;
      const formattedTemplate = {
        id: updated.id,
        name: updated.name,
        gender: updated.gender,
        clothingType: updated.clothingType,
        fields: typeof updated.fields === "string" ? JSON.parse(updated.fields) : updated.fields,
        fitPreferences: updated.fitPreferences ? JSON.parse(updated.fitPreferences) : null,
        collarOptions: updated.collarOptions ? JSON.parse(updated.collarOptions) : null,
        isActive: updated.isActive,
        enableStitchingNotes: updated.enableStitchingNotes,
        dateCreated: new Date(updated.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      setCustomTemplates(prev => prev.map(t => t.id === formattedTemplate.id ? formattedTemplate : t));
      handleCloseEditCustomTemplateModal();
    } else if (fetcher.data?.error) {
      setIsSaving(false);
      console.error("Error:", fetcher.data.error);
    }
  }, [fetcher.data]);

  // Handle image upload completion
  useEffect(() => {
    if (uploadFetcher.state === "idle" && uploadFetcher.data?.url) {
      setGuideImage(uploadFetcher.data.url);
    }
  }, [uploadFetcher.state, uploadFetcher.data]);

  // Sync with loader data when it changes
  useEffect(() => {
    setTemplates(initialTemplates || []);
    setCustomTemplates(initialCustomTemplates || []);
  }, [initialTemplates, initialCustomTemplates]);

  // Use products from Shopify
  const products = shopifyProducts || [];

  const handleToggleFilters = (e) => {
    e.stopPropagation();
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handleOpenViewModal = (templateId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setViewModalTemplate(templateId);
    setModalMainTab("Table Chart");
    setModalSubTab("Details");
    setModalUnit("In");
  };

  const handleCloseViewModal = () => {
    setViewModalTemplate(null);
  };

  const handleOpenAssignModal = (templateId, templateName, e, templateType = 'table') => {
    if (e) {
      e.stopPropagation();
    }
    setAssignModalTemplate({ id: templateId, name: templateName, type: templateType });
    setAssignSearch("");
    // Pre-select products that are already assigned to this template
    const alreadyAssigned = products
      .filter(p => {
        if (templateType === 'custom') {
          return p.assignedCustomTemplateId === templateId;
        }
        return p.assignedTemplateId === templateId;
      })
      .map(p => p.id);
    setSelectedProducts(alreadyAssigned);
    setInitialSelectedProducts(alreadyAssigned);
    setSelectAll(alreadyAssigned.length === products.length);
  };

  const handleCloseAssignModal = () => {
    setAssignModalTemplate(null);
    setSelectedProducts([]);
    setInitialSelectedProducts([]);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      const allProductIds = products.map(p => p.id);
      setSelectedProducts(allProductIds);
      setSelectAll(true);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      setSelectAll(false);
    } else {
      setSelectedProducts([...selectedProducts, productId]);
      if (selectedProducts.length + 1 === products.length) {
        setSelectAll(true);
      }
    }
  };

  // Assign products to template
  const submitAssignment = () => {
    if (!assignModalTemplate) return;

    const formData = new FormData();
    formData.append("intent", "assignProducts");
    formData.append("templateId", assignModalTemplate.id);
    formData.append("templateType", assignModalTemplate.type || "table");
    formData.append("productIds", JSON.stringify(selectedProducts));

    fetcher.submit(formData, { method: "POST" });
    setReassignmentConflicts(null); // Close modal if open
  };

  // Assign products to template
  const handleAssignProducts = () => {
    if (!assignModalTemplate) return;

    // Check for conflicts
    const conflicts = [];
    const isCustom = (assignModalTemplate.type === "custom");

    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const currentAssignedId = isCustom ? product.assignedCustomTemplateId : product.assignedTemplateId;
      const currentAssignedName = isCustom ? product.assignedCustomTemplateName : product.assignedTemplateName;

      // Conflict if assigned to a DIFFERENT template (not null, not current)
      if (currentAssignedId && currentAssignedId !== assignModalTemplate.id) {
        conflicts.push({
          id: product.id,
          name: product.name,
          currentTemplateName: currentAssignedName || "Unknown Template"
        });
      }
    });

    if (conflicts.length > 0) {
      setReassignmentConflicts(conflicts);
      return;
    }

    submitAssignment();
  };

  // Create Template Modal Handlers
  const handleEditTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setIsCreateModalOpen(true);
    setCreateStep(2); // Jump to editor directly

    const gender = template.gender.toLowerCase();
    setSelectedGender(gender);

    // Find category object
    const categoryObj = categories[gender]?.find(c => c.id === template.category);
    setSelectedCategory(categoryObj || null);

    setChartName(template.name);
    setChartColumns(template.columns || []);

    // Ensure rows have IDs
    const rowsWithIds = (template.rows || []).map((r, i) => ({ ...r, id: r.id || Date.now() + i }));
    setChartRows(rowsWithIds);



    setGuideImage(template.guideImage);
    setPendingGuideImage(null);
    setMeasureDescription(template.measureDescription);

    // Set initial state for dirty checking
    setInitialFormState({
      name: template.name,
      // gender/category are handled in step 1 logic usually but we set them here
      columns: template.columns || [],
      rows: rowsWithIds, // Same reference as setChartRows
      guideImage: template.guideImage,
      measureDescription: template.measureDescription
    });

    setIsEditMode(true);
    setEditingTemplateId(templateId);
  };

  // Edit Custom Template Modal Handlers
  const handleOpenEditCustomTemplateModal = (template) => {
    setEditCustomTemplateModal(template);
    setEditCustomTemplateName(template.name);
    // Clone fields with IDs for editing
    const fieldsWithIds = (template.fields || []).map((f, i) => ({ id: Date.now() + i, ...f, enabled: f.enabled !== false }));
    setEditCustomTemplateFields(fieldsWithIds);
    // Load Fit Preferences
    if (template.fitPreferences && template.fitPreferences.length > 0) {
      setEditEnableFitPrefs(true);
      setEditCustomTemplateFitPrefs(template.fitPreferences.map((fp, i) => ({ id: Date.now() + i + 100, ...fp })));
    } else {
      setEditEnableFitPrefs(false);
      setEditCustomTemplateFitPrefs([
        { id: 1, label: "Slim", allowance: "+0.5 inch", enabled: true },
        { id: 2, label: "Regular", allowance: "+2.0 inch", enabled: true },
        { id: 3, label: "Loose", allowance: "+4.0 inch", enabled: true }
      ]);
    }
    // Load Collar Options
    if (template.collarOptions && template.collarOptions.length > 0) {
      setEditEnableCollars(true);
      setEditCustomTemplateCollars(template.collarOptions.map((co, i) => {
        // Auto-fill default images if missing for standard types
        let defaultImage = co.image;
        if (!defaultImage) {
          if (co.name === "Button Down Collar") defaultImage = "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/button+down+color.png";
          else if (co.name === "Band Collar") defaultImage = "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/band+collar%0D%0A%0D%0A.png";
          else if (co.name === "Spread Collar") defaultImage = "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/spread+collar.png";
        }
        return { id: Date.now() + i + 200, ...co, image: defaultImage };
      }));
    } else {
      setEditEnableCollars(false);
      setEditCustomTemplateCollars([
        { id: 1, name: "Button Down Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/button+down+color.png", enabled: true },
        { id: 2, name: "Band Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/band+collar%0D%0A%0D%0A.png", enabled: true },
        { id: 3, name: "Spread Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/spread+collar.png", enabled: true }
      ]);
    }
    // Load Stitching Notes
    setEditEnableStitchingNotes(template.enableStitchingNotes || false);
  };

  // Check if there are unsaved changes in the Edit Custom Template modal
  const hasEditTemplateChanges = () => {
    if (!editCustomTemplateModal) return false;
    const original = editCustomTemplateModal;

    // Helper to normalize strings for comparison (treat null/undefined as "")
    const normalize = (val) => (val === null || val === undefined) ? "" : String(val).trim();
    const normalizeBool = (val) => !!val;

    // Check name
    if (normalize(editCustomTemplateName) !== normalize(original.name)) return true;

    // Check fields length
    const originalFields = original.fields || [];
    if (editCustomTemplateFields.length !== originalFields.length) return true;

    // Check field content
    for (let i = 0; i < originalFields.length; i++) {
      const origField = originalFields[i];
      const editField = editCustomTemplateFields[i];
      if (!editField) return true;
      if (normalize(editField.name) !== normalize(origField.name) ||
        normalize(editField.unit) !== normalize(origField.unit) ||
        normalize(editField.instruction) !== normalize(origField.instruction) ||
        normalize(editField.range) !== normalize(origField.range) ||
        normalizeBool(editField.required) !== normalizeBool(origField.required)) return true;
    }

    // Check Advance Features - Fit Preferences
    const origFitPrefs = original.fitPreferences || [];
    const currentFitPrefs = editCustomTemplateFitPrefs;
    const wasEnabledFit = origFitPrefs.length > 0;

    if (editEnableFitPrefs !== wasEnabledFit) return true;

    if (editEnableFitPrefs) {
      if (currentFitPrefs.length !== origFitPrefs.length) return true;
      for (let i = 0; i < currentFitPrefs.length; i++) {
        const cur = currentFitPrefs[i];
        const orig = origFitPrefs[i];
        if (normalize(cur.label) !== normalize(orig.label) || normalize(cur.allowance) !== normalize(orig.allowance)) return true;
      }
    }

    // Check Advance Features - Collar Options
    const origCollars = original.collarOptions || [];
    const currentCollars = editCustomTemplateCollars;
    const wasEnabledCollars = origCollars.length > 0;

    if (editEnableCollars !== wasEnabledCollars) return true;

    if (editEnableCollars) {
      if (currentCollars.length !== origCollars.length) return true;
      for (let i = 0; i < currentCollars.length; i++) {
        const cur = currentCollars[i];
        const orig = origCollars[i];
        if (normalize(cur.name) !== normalize(orig.name) || normalize(cur.image) !== normalize(orig.image)) return true;
      }
    }

    // Check Stitching Notes
    if (editEnableStitchingNotes !== (original.enableStitchingNotes || false)) return true;

    return false;
  };

  const handleTryCloseEditTemplateModal = () => {
    if (hasEditTemplateChanges()) {
      setShowEditTemplateDiscardWarning(true);
    } else {
      handleCloseEditCustomTemplateModal();
    }
  };

  const handleCloseEditCustomTemplateModal = () => {
    setEditCustomTemplateModal(null);
    setEditCustomTemplateName("");
    setEditCustomTemplateFields([]);
    setEditCustomTemplateFitPrefs([]);
    setEditCustomTemplateCollars([]);
    setEditEnableFitPrefs(false);
    setEditEnableStitchingNotes(false);
    setEditEnableCollars(false);
    setShowEditTemplateDiscardWarning(false);
  };

  const handleUpdateCustomTemplate = async () => {
    if (!editCustomTemplateModal) return;
    if (!editCustomTemplateName.trim()) return;

    // Process field image uploads if any have pending files
    const processedFields = await Promise.all(editCustomTemplateFields.map(async (field) => {
      if (field.file) {
        try {
          const fd = new FormData();
          fd.append("file", field.file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (data.url) {
            const { file, ...rest } = field;
            return { ...rest, image: data.url };
          }
        } catch (e) {
          console.error("Field image upload failed", e);
        }
      }
      const { file, ...rest } = field;
      return rest;
    }));

    // Update editCustomTemplateFields with processed fields (that have image URLs instead of file objects)
    // This ensures the info modal shows the correct image after saving
    const updatedFieldsWithIds = processedFields.map((f, i) => {
      const originalField = editCustomTemplateFields[i];
      return { 
        ...f, 
        id: originalField?.id || Date.now() + i, 
        enabled: originalField?.enabled !== false 
      };
    });
    setEditCustomTemplateFields(updatedFieldsWithIds);

    // Process collar option image uploads
    let processedCollars = editCustomTemplateCollars;
    if (editEnableCollars) {
      processedCollars = await Promise.all(editCustomTemplateCollars.map(async (collar) => {
        if (collar.file) {
          try {
            const fd = new FormData();
            fd.append("file", collar.file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.url) {
              const { file, ...rest } = collar;
              return { ...rest, image: data.url };
            }
          } catch (e) {
            console.error("Collar image upload failed", e);
          }
        }
        const { file, ...rest } = collar;
        return rest;
      }));
    }

    const formData = new FormData();
    formData.append("intent", "updateCustomTemplate");
    formData.append("id", editCustomTemplateModal.id);
    formData.append("name", editCustomTemplateName);
    formData.append("fields", JSON.stringify(processedFields.map(({ id, isEditing, enabled, ...rest }) => rest)));

    // Add Fit Preferences if enabled
    if (editEnableFitPrefs) {
      formData.append("fitPreferences", JSON.stringify(editCustomTemplateFitPrefs.map(({ id, ...rest }) => rest)));
    }

    // Add Collar Options if enabled
    if (editEnableCollars) {
      formData.append("collarOptions", JSON.stringify(processedCollars.map(({ id, ...rest }) => rest)));
    }

    // Add Stitching Notes toggle
    formData.append("enableStitchingNotes", editEnableStitchingNotes.toString());

    fetcher.submit(formData, { method: "POST" });
  };

  // Check for unsaved changes in Edit Field Modal
  const hasFieldChanges = () => {
    if (!editFieldModal) return false;
    const { field, originalField } = editFieldModal;

    // Helper to normalize strings for comparison (treat null/undefined as "")
    const normalize = (val) => (val === null || val === undefined) ? "" : String(val).trim();
    const normalizeBool = (val) => !!val;

    if (normalize(field.name) !== normalize(originalField.name)) return true;
    if (normalize(field.unit) !== normalize(originalField.unit)) return true;
    if (normalize(field.instruction) !== normalize(originalField.instruction)) return true;
    if (normalize(field.range) !== normalize(originalField.range)) return true;
    if (normalizeBool(field.required) !== normalizeBool(originalField.required)) return true;

    // Check if image URL changed (e.g. cleared)
    if (normalize(field.image) !== normalize(originalField.image)) return true;

    // Check if file changed - compare current file with original file
    if (editFieldModalFile !== originalEditFieldModalFile) return true;

    return false;
  };

  const handleTryCloseEditFieldModal = () => {
    if (hasFieldChanges()) {
      setShowEditFieldDiscardWarning(true);
    } else {
      handleCloseEditFieldModal();
    }
  };

  const handleCloseEditFieldModal = () => {
    setEditFieldModal(null);
    setEditFieldModalFile(null);
    setOriginalEditFieldModalFile(null);
    setShowEditFieldDiscardWarning(false);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setCreateStep(1);
    setSelectedGender("male");
    setSelectedCategory(null);
    setChartName("");
    setChartColumns([]);
    setChartRows([]);

    setGuideImage(null);
    setPendingGuideImage(null);
    setMeasureDescription("• Measurement Instructions:\n  Please follow these guidelines to ensure accurate measurements for the best fit.\n\n• Tip:\n  Use a flexible measuring tape for best results.");
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateStep(1);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    // Set default chart name based on category
    const genderLabel = selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1);
    setChartName(`${genderLabel} ${category.label} Chart`);
    if (category.sizeChart) {
      setChartColumns(category.sizeChart.columns);
      setChartRows(category.sizeChart.rows.map((row, idx) => ({ ...row, id: idx })));
      // Set guide image based on gender and category
      const guideImagesMap = selectedGender === "male" ? maleGuideImages : femaleGuideImages;
      setGuideImage(guideImagesMap[category.id] || null);
      // Set measurement description with clean formatting (Title : \n Description)
      if (category.howToMeasure && category.howToMeasure.length > 0) {
        const desc = category.howToMeasure.map(m => `<p><b>${m.title} :</b><br>${m.description}</p>`).join("");
        setMeasureDescription(desc);
      } else {
        // Default text
        setMeasureDescription("<p><b>Measurement Instructions :</b><br>Please follow these guidelines to ensure accurate measurements for the best fit.</p>");
      }
    } else {
      // Custom category
      setChartColumns([{ label: "Size", key: "size" }]);
      setChartRows([{ id: 0, size: "S" }, { id: 1, size: "M" }, { id: 2, size: "L" }, { id: 3, size: "XL" }, { id: 4, size: "XXL" }]);
      setGuideImage(null);
      setMeasureDescription("<p><b>Measurement Instructions :</b><br>Please follow these guidelines to ensure accurate measurements for the best fit.</p><p><b>Tip :</b><br>Use a flexible measuring tape for best results.</p>");
    }
  };

  const handleNextStep = () => {
    if (createStep === 1 && selectedCategory) {
      setCreateStep(2);
    }
  };

  const handleBackStep = () => {
    if (createStep === 2) {
      setCreateStep(1);
    }
  };

  // Preview Modal Handlers
  const handleOpenPreviewModal = () => {
    // Save current content from contenteditable before opening preview
    if (descriptionTextareaRef.current) {
      setMeasureDescription(descriptionTextareaRef.current.innerHTML);
    }
    setIsPreviewModalOpen(true);
    setPreviewSubTab("Details");
    setPreviewUnit("In");
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  // Colored dots for measurements
  const measurementColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  const handleAddColumn = () => {
    const newKey = `col_${Date.now()}`;
    setChartColumns([...chartColumns, { label: "New Column (in)", key: newKey }]);
    setChartRows(chartRows.map(row => ({ ...row, [newKey]: "" })));
    setColumnError(""); // Clear column error when column is added
  };

  const handleRemoveColumn = (keyToRemove) => {
    if (keyToRemove === "size") return; // Don't remove size column
    const newColumns = chartColumns.filter(col => col.key !== keyToRemove);
    setChartColumns(newColumns);
    setChartRows(chartRows.map(row => {
      const newRow = { ...row };
      delete newRow[keyToRemove];
      return newRow;
    }));
    // Clear column error if there are still measurement columns left
    const hasSizeColumn = newColumns.some(col => col.key === "size");
    const measurementColumns = newColumns.filter(col => col.key !== "size");
    if (hasSizeColumn && measurementColumns.length > 0) {
      setColumnError("");
    }
  };

  const handleColumnDragStart = (e, index) => {
    if (chartColumns[index].key === "size") {
      e.preventDefault();
      return false;
    }
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColumnDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) {
      setDraggedColumnIndex(null);
      return;
    }

    if (chartColumns[dropIndex]?.key === "size" || chartColumns[draggedColumnIndex]?.key === "size") {
      setDraggedColumnIndex(null);
      return;
    }

    const newColumns = [...chartColumns];
    const draggedColumn = newColumns[draggedColumnIndex];

    // Calculate insertion index BEFORE removing (to avoid index shifting confusion)
    let insertIndex = dropIndex;

    // If dragging from left to right, we want to insert at the drop position
    // But after removal, indices shift, so we need to adjust
    if (draggedColumnIndex < dropIndex) {
      // Dragging from left to right
      // Example: [Size(0), Col1(1), Col2(2), Col3(3)] - drag Col1 to Col3
      // We want: [Size(0), Col2(1), Col3(2), Col1(3)]
      // After removing Col1: [Size(0), Col2(1), Col3(2)] (indices 0,1,2)
      // Col3 is now at index 2 (was 3), we want Col1 after it, so insert at index 3
      // But since array length is 3, we insert at index 3 (end)
      // So insertIndex = dropIndex (which is 3)
      insertIndex = dropIndex;
    } else {
      // Dragging from right to left - no adjustment needed
      insertIndex = dropIndex;
    }

    // Remove dragged column from its current position
    newColumns.splice(draggedColumnIndex, 1);

    // After removal, if dragging left to right, the dropIndex might be beyond array length
    // Clamp it to the array length (which means insert at the end)
    if (draggedColumnIndex < dropIndex) {
      insertIndex = Math.min(dropIndex, newColumns.length);
    }

    // Ensure insertIndex is within bounds (0 to array.length)
    insertIndex = Math.max(0, Math.min(insertIndex, newColumns.length));

    // Insert the dragged column at the calculated position
    newColumns.splice(insertIndex, 0, draggedColumn);

    setChartColumns(newColumns);
    setDraggedColumnIndex(null);

    // Reset opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleColumnDragEnd = (e) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedColumnIndex(null);
  };

  const handleStartEditColumn = (e, column) => {
    if (e) {
      e.stopPropagation();
    }
    if (column.key === "size") return; // Don't edit size column
    setEditingColumnKey(column.key);
    setEditingColumnName(column.label);
  };

  const handleSaveColumnName = (columnKey) => {
    if (editingColumnName.trim()) {
      setChartColumns(chartColumns.map(col =>
        col.key === columnKey ? { ...col, label: editingColumnName.trim() } : col
      ));
    } else {
      // If empty, restore original name
      const originalColumn = chartColumns.find(col => col.key === columnKey);
      if (originalColumn) {
        setEditingColumnName(originalColumn.label);
      }
    }
    setEditingColumnKey(null);
    setEditingColumnName("");
  };

  const handleCancelEditColumn = () => {
    setEditingColumnKey(null);
    setEditingColumnName("");
  };

  // Text formatting functions for rich text editor
  const applyTextFormat = (formatType) => {
    // Focus the editor first
    if (descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }

    // Apply the formatting command
    switch (formatType) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      default:
        return;
    }

    // Update the content ref
    if (descriptionTextareaRef.current) {
      descriptionContentRef.current = descriptionTextareaRef.current.innerHTML;
    }
  };

  // Handle content change in contenteditable div
  const handleDescriptionChange = (e) => {
    // Only update state, don't re-render the div content
    const newContent = e.currentTarget.innerHTML;
    // Store in a ref to avoid re-rendering issues
    descriptionContentRef.current = newContent;
  };

  // Save description content to state on blur
  const handleDescriptionBlur = () => {
    if (descriptionContentRef.current) {
      setMeasureDescription(descriptionContentRef.current);
    }
  };

  // Save template to database
  const handleSaveTemplate = async () => {
    // Validate name
    if (!chartName.trim()) {
      setNameError("Template name is required");
      return;
    }

    // Validate columns - need at least size column + one measurement column
    const hasSizeColumn = chartColumns.some(col => col.key === "size");
    const measurementColumns = chartColumns.filter(col => col.key !== "size");
    if (!hasSizeColumn || measurementColumns.length === 0) {
      setColumnError("At least one measurement column (besides Size) is required");
      return;
    }

    // Check for duplicate name safeguard
    if (templates.some(t => t.name.trim().toLowerCase() === chartName.trim().toLowerCase() && (!isEditMode || t.id !== editingTemplateId))) {
      setNameError("A template with this name already exists");
      return;
    }

    // Clear errors if validation passes
    setNameError("");
    setColumnError("");

    setIsSaving(true);

    let finalGuideImage = guideImage;

    // Upload image if a new file is selected
    if (pendingGuideImage) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", pendingGuideImage);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const data = await response.json();
        if (data.url) {
          finalGuideImage = data.url;
        } else {
          console.error("Upload failed", data.error);
          // Optional: handle error user facing
        }
      } catch (error) {
        console.error("Upload failed", error);
        setIsSaving(false);
        return;
      }
    }

    // Get latest description from ref
    const finalDescription = descriptionContentRef.current || measureDescription;

    const formData = new FormData();
    formData.append("intent", isEditMode ? "update" : "create");
    if (isEditMode && editingTemplateId) {
      formData.append("id", editingTemplateId);
    }
    formData.append("name", chartName);
    formData.append("gender", selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1));
    formData.append("category", selectedCategory?.id || "custom");
    formData.append("columns", JSON.stringify(chartColumns));
    formData.append("rows", JSON.stringify(chartRows.map(({ id, ...rest }) => rest)));
    formData.append("guideImage", finalGuideImage || "");
    formData.append("measureDescription", finalDescription || "");

    fetcher.submit(formData, { method: "POST" });
  };

  // Delete template
  const handleDeleteTemplate = (templateId) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", templateId);
    fetcher.submit(formData, { method: "POST" });
  };

  // Toggle template status
  const handleToggleStatus = (templateId, currentStatus, templateType = "table") => {
    const formData = new FormData();
    formData.append("intent", "toggleStatus");
    formData.append("id", templateId);
    formData.append("isActive", (!currentStatus).toString());
    formData.append("templateType", templateType);
    fetcher.submit(formData, { method: "POST" });
  };

  const handleAddRow = () => {
    const newRow = { id: Date.now() };
    chartColumns.forEach(col => {
      newRow[col.key] = "";
    });
    setChartRows([...chartRows, newRow]);
  };

  const handleRemoveRow = (rowId) => {
    setChartRows(chartRows.filter(row => row.id !== rowId));
  };

  const handleRowChange = (rowId, key, value) => {
    setChartRows(chartRows.map(row =>
      row.id === rowId ? { ...row, [key]: value } : row
    ));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFiltersOpen && filtersModalRef.current) {
        if (!filtersModalRef.current.contains(event.target)) {
          setIsFiltersOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFiltersOpen]);

  const tableTemplatesCount = templates.length;
  const customTemplatesCount = customTemplates.length;

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    // Search filtering
    const searchLower = templateSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (template.name && template.name.toLowerCase().includes(searchLower)) ||
      (template.gender && template.gender.toLowerCase().includes(searchLower)) ||
      (template.category && template.category.toLowerCase().includes(searchLower))
    );

    // Filter filtering
    // filters: "All", "Male", "Female", "Active", "Inactive"
    let matchesFilter = true;
    if (selectedFilter === "Male") matchesFilter = template.gender === "Male";
    else if (selectedFilter === "Female") matchesFilter = template.gender === "Female";
    // Assuming isActive is boolean true/false or 1/0
    else if (selectedFilter === "Active") matchesFilter = Boolean(template.isActive) === true;
    else if (selectedFilter === "Inactive") matchesFilter = Boolean(template.isActive) === false;

    return matchesSearch && matchesFilter;
  });

  const filteredCustomTemplates = customTemplates.filter(template => {
    // Search filtering
    const searchLower = templateSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (template.name && template.name.toLowerCase().includes(searchLower)) ||
      (template.gender && template.gender.toLowerCase().includes(searchLower)) ||
      (template.clothingType && template.clothingType.toLowerCase().includes(searchLower))
    );

    // Filter filtering
    let matchesFilter = true;
    if (selectedFilter === "Male") matchesFilter = template.gender === "Male";
    else if (selectedFilter === "Female") matchesFilter = template.gender === "Female";
    // Assuming isActive is boolean true/false or 1/0
    else if (selectedFilter === "Active") matchesFilter = Boolean(template.isActive) === true;
    else if (selectedFilter === "Inactive") matchesFilter = Boolean(template.isActive) === false;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="p-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Select Template</h1>
          <p className="text-sm text-gray-600">Choose a size chart template to assign to this product.</p>
        </div>

        {/* Tabs, Search, Filters, and Create Button */}
        <div className="mb-5 flex items-center justify-between gap-3  w-full">
          {/* Tabs */}
          <div className="flex ">
            <div className="flex w-fit   gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200 " >
              <button
                type="button"
                onClick={() => setActiveTab("Table Templates")}
                className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-all duration-200  ${activeTab === "Table Templates"
                  ? "bg-white text-gray-900 shadow-sm  font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                Table Templates ({tableTemplatesCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Custom Templates")}
                className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-all duration-200  ${activeTab === "Custom Templates"
                  ? "bg-white text-gray-900 shadow-sm  font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                Custom Templates ({customTemplatesCount})
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end  gap-2.5  ">
            {/* Search Bar */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search templates by name, gender, category..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-10 h-[46px] pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 w-80 text-sm placeholder-gray-400"
              />
            </div>

            {/* Filters Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleFilters}
                className={`flex items-center cursor-pointer gap-2 px-3.5 py-2 text-sm font-medium bg-white border rounded-md transition-all duration-200 shadow-sm hover:shadow ${isFiltersOpen
                  ? "text-gray-900 border-gray-400 bg-gray-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              {isFiltersOpen && (
                <div
                  ref={filtersModalRef}
                  className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Filters</h3>
                    <div className="flex gap-2">
                      {["All", "Male", "Female", "Active", "Inactive"].map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-4 py-2 cursor-pointer text-sm font-medium rounded-lg transition-all duration-200 border whitespace-nowrap ${selectedFilter === filter
                            ? "bg-gray-800 text-white border-gray-800"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Template Button */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "Custom Templates") {
                  window.location.href = "/app/tailor";
                } else {
                  handleOpenCreateModal();
                }
              }}
              className="flex w-fit items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === "Custom Templates" ? "Create Custom Tailor Template" : "Create Table Template"}
            </button>
          </div>
        </div>

        {/* Templates Table - Table Templates Tab */}
        {activeTab === "Table Templates" && (
          <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NAME</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DATE CREATED</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GENDER</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">STATUS</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-32 text-center text-gray-500 bg-white">
                      {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Create first template</h3>
                          <p className="text-sm text-gray-500 mb-6 text-balance">Get started by creating your first size chart template to assign to your products.</p>
                          <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Table Template
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <h3 className="text-base font-medium text-gray-900 mb-1">No templates found</h3>
                          <p className="text-sm text-gray-500 mb-4">No templates match your current filters.</p>
                          <button
                            onClick={() => { setTemplateSearch(""); setSelectedFilter("All"); }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Clear all filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                {filteredTemplates.map((template, index) => (
                  <tr key={template.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index === filteredTemplates.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{template.dateCreated}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                        {template.gender}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(template.id, template.isActive, "table")}
                          className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${template.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${template.isActive ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center gap-4 justify-end">
                        <button
                          type="button"
                          onClick={(e) => handleOpenViewModal(template.id, e)}
                          className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-100 px-3 py-2 rounded-md border border-blue-200 hover:text-blue-700 hover:bg-blue-200 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditTemplate(template.id); }}
                          className="p-2  flex items-center gap-1.5 text-sm  font-medium text-gray-400 text-gray-600 bg-gray-100 rounded-md transition-all duration-200 border  border border-gray-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenAssignModal(template.id, template.name, e)}
                          className="p-2 flex items-center cursor-pointer text-sm font-medium gap-1 text-gray-400 text-gray-600 bg-gray-100 rounded-md transition-all duration-200 border  border-gray-200"
                          title="Assign"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTemplate(template)}
                          className="p-2 cursor-pointer text-red-400 text-red-600 bg-red-50 rounded-md transition-all duration-200 border border-red-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>

                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Custom Templates Tab */}
        {activeTab === "Custom Templates" && (
          <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NAME</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DATE CREATED</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GENDER</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">TYPE</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">STATUS</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomTemplates.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-32 text-center text-gray-500 bg-white">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No custom templates match your search</h3>
                        <p className="text-sm text-gray-500 mb-6 text-balance">Try adjusting your filters or search terms.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredCustomTemplates.map((template, index) => (
                  <tr key={template.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index === filteredCustomTemplates.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{template.dateCreated}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                        {template.gender}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200 capitalize">
                        {template.clothingType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(template.id, template.isActive, "custom")}
                          className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${template.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${template.isActive ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center gap-4 justify-end">
                        <button
                          type="button"
                          onClick={() => setViewCustomTemplateModal(template)}
                          className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-100 px-3 py-2 rounded-md border border-blue-200 hover:text-blue-700 hover:bg-blue-200 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenEditCustomTemplateModal(template); }}
                          className="p-2 flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md transition-all duration-200 border border-gray-200 cursor-pointer hover:bg-gray-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenAssignModal(template.id, template.name, e, 'custom')}
                          className="p-2 flex items-center cursor-pointer text-sm font-medium gap-1 text-gray-600 bg-gray-100 rounded-md transition-all duration-200 border border-gray-200 hover:bg-gray-200"
                          title="Assign"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCustomTemplateConfirm(template)}
                          className="p-2 cursor-pointer text-red-600 bg-red-50 rounded-md transition-all duration-200 border border-red-200 hover:bg-red-100"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Template Modal */}
      {viewModalTemplate && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseViewModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center justify-between gap-6 flex-1">
                <h2 className="text-xl font-bold text-gray-900">{templates.find(t => t.id === viewModalTemplate)?.name || "Template"}</h2>

                {/* Unit Toggle */}
                <div className="flex gap-2 ml-auto">
                  {["In", "cm"].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setModalUnit(unit)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${modalUnit === unit
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sub-Tabs - Fixed */}
            <div className="px-6 pt-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex gap-6">
                {["Details", "How to Measure"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setModalSubTab(tab)}
                    className={`pb-3 px-1 cursor-pointer text-sm font-medium transition-colors ${modalSubTab === tab
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-auto p-6">
              {/* Table Chart Content */}
              {modalMainTab === "Table Chart" && modalSubTab === "Details" && (() => {
                const currentTemplate = templates.find(t => t.id === viewModalTemplate);
                if (!currentTemplate) return <div>Template not found</div>;
                const cols = currentTemplate.columns || [];
                const rows = currentTemplate.rows || [];
                return (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            {cols.map((col) => (
                              <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200 min-w-[100px]">
                                {col.label.replace('(in)', `(${modalUnit})`).replace('(cm)', `(${modalUnit})`)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {cols.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                                  {row[col.key] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* How to Measure Content */}
              {modalMainTab === "Table Chart" && modalSubTab === "How to Measure" && (() => {
                const currentTemplate = templates.find(t => t.id === viewModalTemplate);
                if (!currentTemplate) return <div className="p-4 text-red-500">Template data not found</div>;

                return (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">How to measure</h3>

                    <div className="flex gap-8 flex-col lg:flex-row">
                      {/* Image */}
                      <div className="flex-1 flex justify-center items-start">
                        {currentTemplate.guideImage ? (
                          <div className="w-full max-w-md border border-gray-200 rounded-lg p-2 bg-white">
                            <img
                              src={currentTemplate.guideImage}
                              alt={`${currentTemplate.name} Guide`}
                              className="w-full h-auto rounded object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-sm">No guide image available</p>
                          </div>
                        )}
                      </div>

                      {/* Instructions */}
                      <div className="flex-1">
                        {currentTemplate.measureDescription ? (
                          <div
                            className="prose prose-sm max-w-none text-gray-600 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mb-2 [&_h4]:flex [&_h4]:items-center [&_h4]:gap-2 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4"
                            dangerouslySetInnerHTML={{ __html: currentTemplate.measureDescription }}
                          />
                        ) : (
                          <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                            No measurement instructions provided for this template.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )
      }

      {/* Assign Template Modal */}
      {
        assignModalTemplate && (
          <div
            className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseAssignModal();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-start justify-between p-4 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  {/* Chain Link Icon */}
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Assign Template to Products</h2>
                    <p className="text-sm text-gray-600">Select products to assign this size chart template '{assignModalTemplate.name}'.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className="ml-4 p-2 hover:bg-gray-100 flex items-center justify-center rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 pt-4 pb-4 border-b border-gray-200">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by product name, ID, or handle..."
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Select All */}
              <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700 cursor-pointer">Select All</label>
                </div>
                <span className="text-sm text-gray-600">{selectedProducts.length} products selected</span>
              </div>

              {/* Product List - Scrollable */}
              <div className="flex-1 overflow-auto">
                <div className="divide-y divide-gray-200">
                  {products
                    .filter(product =>
                      assignSearch === "" ||
                      product.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                      product.productId.includes(assignSearch)
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className={`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${product.hasWarning ? "bg-orange-50" : ""
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />

                        {/* Product Image/Icon */}
                        <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image && product.image !== "placeholder" ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
                              <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                <span>ID: {product.productId}</span>
                                {assignModalTemplate?.type === "table" && product.assignedTemplateName && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${product.assignedTemplateId === assignModalTemplate?.id
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                    }`}>
                                    {product.assignedTemplateId === assignModalTemplate?.id
                                      ? "Assigned to this template"
                                      : `Assigned to: ${product.assignedTemplateName}`
                                    }
                                  </span>
                                )}
                                {assignModalTemplate?.type === "custom" && product.assignedCustomTemplateName && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${product.assignedCustomTemplateId === assignModalTemplate?.id
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                    }`}>
                                    {product.assignedCustomTemplateId === assignModalTemplate?.id
                                      ? "Assigned to this template"
                                      : `Assigned to: ${product.assignedCustomTemplateName}`
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignProducts}
                  disabled={fetcher.state !== "idle" || (
                    selectedProducts.length === initialSelectedProducts.length &&
                    selectedProducts.every(id => initialSelectedProducts.includes(id)) &&
                    initialSelectedProducts.every(id => selectedProducts.includes(id))
                  )}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${fetcher.state !== "idle" || (
                    selectedProducts.length === initialSelectedProducts.length &&
                    selectedProducts.every(id => initialSelectedProducts.includes(id)) &&
                    initialSelectedProducts.every(id => selectedProducts.includes(id))
                  )
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-sm"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 shadow-md hover:shadow-lg"
                    }`}
                >

                  {fetcher.state !== "idle" ? "Assigning..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Reassignment Confirmation Modal */}
      {reassignmentConflicts && (
        <div className="fixed inset-0 bg-black/50 z-[350] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reassign Products?</h3>
                <p className="text-sm text-gray-600">Some selected products are already assigned to other templates.</p>
              </div>
            </div>

            <div className="mb-6 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-100">
              <ul className="space-y-2">
                {reassignmentConflicts.map(product => (
                  <li key={product.id} className="text-sm text-gray-700 flex justify-between">
                    <span className="font-medium truncate max-w-[50%]">{product.name}</span>
                    <span className="text-gray-500 text-xs">Currently: {product.currentTemplateName}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Continuing will unassign them from their current templates and assign them to <strong>"{assignModalTemplate?.name}"</strong>.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReassignmentConflicts(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAssignment}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Reassign & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Size Chart Modal */}
      {
        isCreateModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseCreateModal();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Edit Table Template" : (createStep === 1 ? "Create Size Chart" : "Create Size Chart Details")}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6">
                {/* Step 1: Select Gender & Category */}
                {createStep === 1 && (
                  <div>
                    {/* Select Gender */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Select Gender</h3>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGender("male");
                            setSelectedCategory(null);
                          }}
                          className={`flex cursor-pointer flex-col items-center justify-center w-24 h-24 rounded-lg border-2 transition-all duration-200 ${selectedGender === "male"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <img src={maleIcon} alt="Male" className="w-12 h-12 mb-1" />
                          <span className={`text-sm font-medium ${selectedGender === "male" ? "text-blue-600" : "text-gray-700"}`}>
                            Male
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGender("female");
                            setSelectedCategory(null);
                          }}
                          className={`flex cursor-pointer flex-col items-center justify-center w-24 h-24 rounded-lg border-2 transition-all duration-200 ${selectedGender === "female"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <img src={femaleIcon} alt="Female" className="w-12 h-12 mb-1" />
                          <span className={`text-sm font-medium ${selectedGender === "female" ? "text-blue-600" : "text-gray-700"}`}>
                            Female
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Select Category */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Select Category</h3>
                      <div className="flex flex-wrap gap-4">
                        {categories[selectedGender].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectCategory(cat)}
                            className={`flex flex-col items-center cursor-pointer justify-center w-24 h-24 rounded-lg border-2 transition-all duration-200 ${selectedCategory?.id === cat.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
                              }`}
                          >
                            <img src={cat.icon} alt={cat.label} className="w-10 h-10 mb-1" />
                            <span className={`text-xs font-medium text-center ${selectedCategory?.id === cat.id ? "text-blue-600" : "text-gray-700"}`}>
                              {cat.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Chart Details */}
                {createStep === 2 && (
                  <div>
                    {/* Chart Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Chart Name</label>
                      <input
                        type="text"
                        value={chartName}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setChartName(newName);

                          // Check for duplicate name
                          const isDuplicate = templates.some(t =>
                            t.name.trim().toLowerCase() === newName.trim().toLowerCase() &&
                            (!isEditMode || t.id !== editingTemplateId)
                          );

                          if (isDuplicate) {
                            setNameError("A template with this name already exists");
                          } else {
                            setNameError("");
                          }
                        }}
                        placeholder="Name"
                        className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${nameError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
                          }`}
                      />
                      {nameError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {nameError}
                        </p>
                      )}
                    </div>

                    {/* Size Chart Table */}
                    <div className="mb-6 overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            {chartColumns.map((col, idx) => (
                              <th
                                key={col.key}
                                draggable={col.key !== "size"}
                                onDragStart={(e) => {
                                  if (col.key !== "size") {
                                    handleColumnDragStart(e, idx);
                                  }
                                }}
                                onDragOver={(e) => {
                                  if (col.key !== "size") {
                                    handleColumnDragOver(e);
                                  }
                                }}
                                onDrop={(e) => {
                                  if (col.key !== "size" && draggedColumnIndex !== null && draggedColumnIndex !== idx) {
                                    handleColumnDrop(e, idx);
                                  }
                                }}
                                onDragEnd={handleColumnDragEnd}
                                className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 border border-gray-200 min-w-[100px] ${col.key !== "size" ? "cursor-move hover:bg-gray-100" : "cursor-default"
                                  } ${draggedColumnIndex === idx ? "opacity-50" : ""}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  {/* Drag handle icon - only for non-size columns */}
                                  {col.key !== "size" && (
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-grab" fill="currentColor" viewBox="0 0 24 24" title="Drag to reorder">
                                      <circle cx="9" cy="6" r="1.5" />
                                      <circle cx="15" cy="6" r="1.5" />
                                      <circle cx="9" cy="12" r="1.5" />
                                      <circle cx="15" cy="12" r="1.5" />
                                      <circle cx="9" cy="18" r="1.5" />
                                      <circle cx="15" cy="18" r="1.5" />
                                    </svg>
                                  )}
                                  {editingColumnKey === col.key ? (
                                    <input
                                      type="text"
                                      value={editingColumnName}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setEditingColumnName(e.target.value);
                                      }}
                                      onBlur={(e) => {
                                        e.stopPropagation();
                                        handleSaveColumnName(col.key);
                                      }}
                                      onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleSaveColumnName(col.key);
                                        } else if (e.key === "Escape") {
                                          e.preventDefault();
                                          handleCancelEditColumn();
                                        }
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onDragStart={(e) => e.stopPropagation()}
                                      className="flex-1 px-2 py-1 text-xs font-semibold border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white z-10"
                                      autoFocus
                                    />
                                  ) : (
                                    <span className="flex-1 select-none font-semibold text-gray-700">
                                      {col.label}
                                    </span>
                                  )}
                                  {col.key !== "size" && (
                                    <div className="flex items-center  flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEditColumn(e, col);
                                        }}
                                        className="p-1.5 text-gray-500 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit column name"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveColumn(col.key);
                                        }}
                                        className="p-1.5 text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        title="Delete column"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th onClick={handleAddColumn} className="px-3  py-2.5 cursor-pointer text-center text-xs font-semibold text-gray-700 border border-gray-200 w-12">
                              <button
                                type="button"
                                className="text-gray-500 cursor-pointer "
                                title="Add column"
                              >
                                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </th>
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 border border-gray-200 w-20">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartRows.map((row) => (
                            <tr key={row.id}>
                              {chartColumns.map((col) => (
                                <td key={col.key} className="px-2 py-2 border border-gray-200 min-w-[100px]">
                                  <input
                                    type="text"
                                    value={row[col.key] || ""}
                                    onChange={(e) => handleRowChange(row.id, col.key, e.target.value)}
                                    className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                </td>
                              ))}
                              <td className="px-2 py-2 border border-gray-200"></td>
                              <td className="px-2 py-2 border border-gray-200 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="text-red-500 cursor-pointer hover:text-red-700"
                                >
                                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Add Row Button */}
                      <div onClick={handleAddRow} className="border cursor-pointer border-gray-200 border-t-0 py-2 flex justify-center">
                        <button
                          type="button"

                          className="text-gray-500 cursor-pointer hover:text-blue-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      {columnError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {columnError}
                        </p>
                      )}
                    </div>

                    {/* Measurement Instructions */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Add Measurement instructions <span className="text-gray-500 font-normal">(Optional)</span>
                      </h3>

                      <div className="flex gap-6 items-start">
                        {/* Guide Image */}
                        <div className="flex-shrink-0">
                          {(pendingGuideImage || guideImage) ? (
                            <img
                              src={pendingGuideImage ? URL.createObjectURL(pendingGuideImage) : guideImage}
                              alt="Guide"
                              className="w-56 h-auto rounded-md border border-gray-200 object-contain"
                            />
                          ) : (
                            <div className="w-56 h-64 bg-gray-50 border border-dashed border-gray-300 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-sm">No image</span>
                            </div>
                          )}
                        </div>

                        {/* Image Upload & Description */}
                        <div className="flex-1 space-y-4">
                          {/* File Upload Section */}
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setPendingGuideImage(file);
                                    }
                                  }}
                                />
                                <span className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-block">
                                  {uploadFetcher.state !== "idle" ? "Uploading..." : "Choose File"}
                                </span>
                              </label>
                              <span className="text-sm text-gray-500">
                                {pendingGuideImage ? pendingGuideImage.name : "No file chosen (Optional)"}
                              </span>
                            </div>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 underline">
                              Upload an image to show measurement instructions to customers
                            </a>
                          </div>


                        </div>
                      </div>
                      {/* Description Section */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-900 my-4 text-[16px]">Description</label>
                        <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
                          {/* Toolbar */}
                          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                            <button
                              type="button"
                              onClick={() => applyTextFormat('bold')}
                              className="px-2.5 cursor-pointer py-1 text-sm font-bold text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                              title="Bold (select text first)"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTextFormat('italic')}
                              className="px-2.5 py-1 cursor-pointer text-sm italic text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                              title="Italic (select text first)"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTextFormat('underline')}
                              className="px-2.5 py-1 cursor-pointer text-sm underline text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                              title="Underline (select text first)"
                            >
                              U
                            </button>
                          </div>
                          {/* Rich Text Editor */}
                          <div
                            ref={descriptionTextareaRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            className="w-full px-4 py-3 text-sm text-gray-900 focus:outline-none min-h-[120px] leading-relaxed overflow-auto border-0"
                            style={{ fontFamily: 'inherit', outline: 'none' }}
                            dangerouslySetInnerHTML={{ __html: measureDescription }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                {createStep === 1 ? (
                  <>
                    <div></div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!selectedCategory}
                      className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${!selectedCategory
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-800 text-white hover:bg-gray-900"
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenPreviewModal}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Chart
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBackStep}
                        className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                      </button>
                      {(() => {
                        const hasSizeColumn = chartColumns.some(col => col.key === "size");
                        const measurementColumns = chartColumns.filter(col => col.key !== "size");
                        const hasValidColumns = hasSizeColumn && measurementColumns.length > 0;
                        const isDisabled = !chartName.trim() || !hasValidColumns || isSaving || !!nameError || !!columnError || (isEditMode && initialFormState && (
                          chartName === initialFormState.name &&
                          JSON.stringify(chartColumns) === JSON.stringify(initialFormState.columns) &&
                          JSON.stringify(chartRows) === JSON.stringify(initialFormState.rows) &&
                          (guideImage || "") === (initialFormState.guideImage || "") &&
                          !pendingGuideImage &&
                          (measureDescription || "") === (initialFormState.measureDescription || "")
                        ));
                        return (
                          <button
                            type="button"
                            onClick={handleSaveTemplate}
                            disabled={isDisabled}
                            className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${isDisabled
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"
                              }`}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Preview Chart Modal */}
      {
        isPreviewModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClosePreviewModal();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">{chartName || "Chart 1"}</h2>
                <div className="flex items-center gap-3">
                  {/* Unit Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {["In", "cm"].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setPreviewUnit(unit)}
                        className={`px-4 py-1.5 text-sm font-medium cursor-pointer rounded-md transition-colors ${previewUnit === unit
                          ? "bg-gray-800 text-white"
                          : "text-gray-600 hover:text-gray-900"
                          }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClosePreviewModal}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex-shrink-0 flex gap-6 px-5 pt-4 border-b border-gray-200">
                {["Details", "How to Measure"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPreviewSubTab(tab)}
                    className={`pb-3 text-sm font-medium cursor-pointer transition-colors border-b-2 ${previewSubTab === tab
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {previewSubTab === "Details" && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {chartColumns.map((col, idx) => (
                            <th
                              key={col.key}
                              className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200 ${idx === 0 ? 'rounded-tl-lg' : ''} ${idx === chartColumns.length - 1 ? 'rounded-tr-lg' : ''}`}
                            >
                              {col.label.replace('(in)', `(${previewUnit})`).replace('(cm)', `(${previewUnit})`)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {chartRows.map((row, rowIdx) => (
                          <tr key={row.id}>
                            {chartColumns.map((col, colIdx) => (
                              <td
                                key={col.key}
                                className={`px-4 py-3 text-sm border border-gray-200 ${colIdx === 0 ? 'font-medium text-gray-900' : 'text-gray-700'
                                  } ${rowIdx === chartRows.length - 1 && colIdx === 0 ? 'rounded-bl-lg' : ''} ${rowIdx === chartRows.length - 1 && colIdx === chartColumns.length - 1 ? 'rounded-br-lg' : ''}`}
                              >
                                {row[col.key] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewSubTab === "How to Measure" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">How to measure</h3>
                    <div className="flex gap-8">
                      {/* Guide Image Placeholder */}
                      {guideImage && <div className="flex-shrink-0 w-56">
                        {guideImage ? (
                          <img
                            src={guideImage}
                            alt="Measurement Guide"
                            className="w-full h-auto rounded-lg border border-gray-200 object-contain"
                          />
                        ) : (
                          <div className="w-56 h-56 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                            <svg className="w-20 h-16 text-gray-300 mb-3" fill="none" viewBox="0 0 200 100">
                              <rect x="10" y="10" width="180" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeDasharray="0" />
                              <circle cx="50" cy="35" r="8" fill="#e5e7eb" />
                              <path d="M 30 70 L 50 45 L 70 55 L 100 30 L 130 50 L 170 40 L 170 70 L 30 70 Z" fill="#e5e7eb" />
                            </svg>
                            <p className="text-sm text-gray-500 font-medium">No guide image available saas</p>
                          </div>
                        )}
                      </div>}

                      {/* Measurement Instructions - Shows user's custom description */}
                      <div className="flex-1">
                        {measureDescription ? (
                          <div
                            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: measureDescription }}
                          />
                        ) : (
                          <div className="space-y-5">
                            {selectedCategory?.howToMeasure?.map((measure, idx) => (
                              <div key={idx}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: measurementColors[idx % measurementColors.length] }}
                                  />
                                  <h4 className="text-base font-semibold text-gray-900">{measure.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed pl-5">{measure.description}</p>
                              </div>
                            ))}
                            {(!selectedCategory?.howToMeasure || selectedCategory.howToMeasure.length === 0) && (
                              <div className="text-sm text-gray-500">
                                <p>Please follow the standard measurement guidelines for accurate sizing.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTemplate && (
        <div
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteConfirmTemplate(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            {(() => {
              const assignedCount = products?.filter(p => p.assignedTemplateId === deleteConfirmTemplate.id).length || 0;

              if (assignedCount > 0) {
                return (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Cannot Delete Template</h3>
                        <p className="text-sm text-gray-600">Template "{deleteConfirmTemplate.name}" is currently in use.</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                      This template is currently assigned to <strong className="text-gray-900">{assignedCount} products</strong>.
                      You must unassign it from all products before it can be deleted.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTemplate(null)}
                        className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              }

              return (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Delete Template</h3>
                      <p className="text-sm text-gray-600">Are you sure you want to delete "{deleteConfirmTemplate.name}"?</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">This action cannot be undone. All products assigned to this template will be unassigned.</p>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmTemplate(null)}
                      className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(deleteConfirmTemplate.id)}
                      className="px-4 py-2 cursor-pointer text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-700 transition-colors border border-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* View Custom Template Modal - Customer Preview Style */}
      {viewCustomTemplateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewCustomTemplateModal(null);
              setCustomTemplateViewTab("details");
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewCustomTemplateModal.name}</h2>
                  <p className="text-xs text-gray-500">{viewCustomTemplateModal.gender} • {viewCustomTemplateModal.clothingType}</p>
                </div>
              </div>
              <button
                onClick={() => { setViewCustomTemplateModal(null); setCustomTemplateViewTab("details"); }}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-5">
              <button
                onClick={() => setCustomTemplateViewTab("details")}
                className={`py-3 px-1 text-sm font-medium mr-6 cursor-pointer border-b-2 transition-colors ${customTemplateViewTab === "details"
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Details
              </button>
              <button
                onClick={() => setCustomTemplateViewTab("howto")}
                className={`py-3 px-1 text-sm font-medium cursor-pointer border-b-2 transition-colors ${customTemplateViewTab === "howto"
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                How to Measure
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {/* Details Tab Content */}
              {customTemplateViewTab === "details" && (
                <>
                  {/* Measurement Fields */}
                  {viewCustomTemplateModal.fields?.filter(f => f.enabled !== false).map((field, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {/* Info Icon */}
                      <div className="flex items-center gap-2 min-w-[130px]">
                        <button
                          onClick={() => setCustomTemplateInfoField(field)}
                          className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                          title="View Instructions"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        {/* Label */}
                        <label className="text-sm font-medium text-gray-700">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                      </div>
                      {/* Input */}
                      <input
                        type="text"
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                        readOnly
                      />
                    </div>
                  ))}
                  {(!viewCustomTemplateModal.fields || viewCustomTemplateModal.fields.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No measurement fields in this template.</p>
                  )}

                  {/* Fit Preferences */}
                  {viewCustomTemplateModal.fitPreferences && viewCustomTemplateModal.fitPreferences.length > 0 && (
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Fit Preference</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {viewCustomTemplateModal.fitPreferences.filter(f => f.enabled !== false).map((fit, idx) => (
                          <div key={idx} className="text-center py-2 px-1 border border-gray-200 rounded-md text-sm text-gray-600 flex flex-col items-center justify-center min-h-[60px]">
                            <span className="font-medium">{fit.label}</span>
                            <span className="text-[10px] opacity-70">({fit.allowance})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stitching Notes */}
                  {viewCustomTemplateModal.enableStitchingNotes && (
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Stitching Notes</h3>
                      <textarea
                        placeholder="Add any specific instructions for stitching..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400 resize-none"
                        readOnly
                      />
                    </div>
                  )}

                  {/* Collar Options */}
                  {viewCustomTemplateModal.collarOptions && viewCustomTemplateModal.collarOptions.length > 0 && (
                    <div className="border-t border-gray-100 pt-6 pb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Collar Option</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {viewCustomTemplateModal.collarOptions.filter(c => c.enabled !== false).map((collar, idx) => (
                          <div
                            key={idx}
                            className="cursor-pointer border border-gray-200 rounded-lg p-2 text-center transition-all hover:bg-gray-50"
                          >
                            <div className="w-full h-24 mb-2 bg-white rounded flex items-center justify-center overflow-hidden border border-gray-100">
                              {collar.image ? (
                                <img src={collar.image} alt={collar.name} className="h-full w-full object-contain p-2" />
                              ) : (
                                <span className="text-xs text-gray-400">No Image</span>
                              )}
                            </div>
                            <span className="text-sm font-medium">{collar.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* How to Measure Tab Content */}
              {customTemplateViewTab === "howto" && (
                <div className="space-y-4">
                  {viewCustomTemplateModal.fields?.filter(f => f.enabled !== false).map((field, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-4 relative"
                    >
                      {/* Info button */}
                      <button
                        onClick={() => setCustomTemplateInfoField(field)}
                        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500 border border-gray-200 rounded-full cursor-pointer transition-colors"
                        title="View detailed instructions"
                      >
                        <span className="text-xs font-medium">i</span>
                      </button>

                      {/* Field name */}
                      <h4 className="text-base font-medium text-gray-900 mb-2 pr-8">
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </h4>

                      {/* Instruction */}
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {field.instruction || "No instructions provided."}
                      </p>

                      {/* Range */}
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Range: {field.range} {field.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!viewCustomTemplateModal.fields || viewCustomTemplateModal.fields.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No measurement fields in this template.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => { setViewCustomTemplateModal(null); setCustomTemplateViewTab("details"); }}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Field Info Modal */}
      {customTemplateInfoField && (
        <div
          className="fixed inset-0 bg-black/50 z-[500] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setCustomTemplateInfoField(null); }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{customTemplateInfoField.name}</h3>
              <button
                onClick={() => setCustomTemplateInfoField(null)}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 flex flex-col items-center justify-center">
              {(customTemplateInfoField.image || customTemplateInfoField.file) ? (
                <div className="w-[250px] h-[250px] bg-gray-50 rounded-lg mb-6 overflow-hidden border border-gray-100">
                  <img 
                    src={customTemplateInfoField.file ? URL.createObjectURL(customTemplateInfoField.file) : customTemplateInfoField.image} 
                    alt={customTemplateInfoField.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-50 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-sm text-gray-400">No guide image available</span>
                </div>
              )}
              <div className="mb-6 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-900">Instructions</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{customTemplateInfoField.instruction || "No instructions provided."}</p>
              </div>
              <div className="w-full">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Measurement Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Unit</span>
                    <span className="text-sm font-medium text-gray-900">{customTemplateInfoField.unit}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Range</span>
                    <span className="text-sm font-medium text-gray-900">{customTemplateInfoField.range} {customTemplateInfoField.unit}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Required</span>
                    <span className={`text-sm font-medium ${customTemplateInfoField.required ? 'text-red-600' : 'text-gray-500'}`}>
                      {customTemplateInfoField.required ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Custom Template Confirmation Modal */}
      {deleteCustomTemplateConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteCustomTemplateConfirm(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Custom Template</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete "{deleteCustomTemplateConfirm.name}"?</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteCustomTemplateConfirm(null)}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const formData = new FormData();
                  formData.append("intent", "deleteCustomTemplate");
                  formData.append("id", deleteCustomTemplateConfirm.id);
                  fetcher.submit(formData, { method: "POST" });
                }}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-red-500 border border-red-500 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Custom Template Modal */}
      {editCustomTemplateModal && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-start gap-4 p-5 border-b border-gray-200">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">Edit Custom Template</h2>
                <p className="text-sm text-gray-500">{editCustomTemplateModal.name}</p>
              </div>
              <button
                type="button"
                onClick={handleTryCloseEditTemplateModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5 space-y-6">
              {/* Template Name */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">Template Information</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Template Name</label>
                  <input
                    type="text"
                    value={editCustomTemplateName}
                    onChange={(e) => setEditCustomTemplateName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Template name"
                  />
                </div>
              </div>

              {/* Measurement Fields */}
              <div>
                <div className="flex items-center gap-2 mb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Measurement Fields</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{editCustomTemplateFields.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newField = {
                        id: Date.now(),
                        name: "New Field",
                        unit: "in",
                        instruction: "",
                        range: "",
                        required: false,
                        enabled: true
                      };
                      setEditCustomTemplateFields(prev => [newField, ...prev]);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Field
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {editCustomTemplateFields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => setDraggedItemIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault(); // Necessary to allow dropping
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedItemIndex === null || draggedItemIndex === index) return;

                        const newFields = [...editCustomTemplateFields];
                        const [movedItem] = newFields.splice(draggedItemIndex, 1);
                        newFields.splice(index, 0, movedItem);

                        setEditCustomTemplateFields(newFields);
                        setDraggedItemIndex(null);
                      }}
                      onDragEnd={() => setDraggedItemIndex(null)}
                      className={`flex items-start gap-3 p-3 border border-gray-200 rounded-lg transition-colors ${draggedItemIndex === index ? 'bg-blue-50 border-blue-300 opacity-50' : 'bg-gray-50'
                        }`}
                    >
                      {/* Drag Handle */}
                      <div className="text-gray-400 mt-1 cursor-grab">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      {/* Field Info / Inline Edit */}
                      <div className="flex-1 min-w-0">
                        {field.isEditing ? (
                          /* Inline Edit Mode */
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => setEditCustomTemplateFields(prev =>
                                  prev.map((f, i) => i === index ? { ...f, name: e.target.value } : f)
                                )}
                                className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Field name"
                              />
                              <select
                                value={field.unit || "in"}
                                onChange={(e) => setEditCustomTemplateFields(prev =>
                                  prev.map((f, i) => i === index ? { ...f, unit: e.target.value } : f)
                                )}
                                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="in">in</option>
                                <option value="cm">cm</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={field.instruction || ""}
                              onChange={(e) => setEditCustomTemplateFields(prev =>
                                prev.map((f, i) => i === index ? { ...f, instruction: e.target.value } : f)
                              )}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Measurement instruction"
                            />
                            <input
                              type="text"
                              value={field.range || ""}
                              onChange={(e) => {
                                // Only allow numbers, spaces, dashes, and commas
                                const value = e.target.value.replace(/[^0-9\s\-,]/g, '');
                                setEditCustomTemplateFields(prev =>
                                  prev.map((f, i) => i === index ? { ...f, range: value } : f)
                                );
                              }}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Range (e.g., 20-50)"
                            />
                            <button
                              type="button"
                              onClick={() => setEditCustomTemplateFields(prev =>
                                prev.map((f, i) => i === index ? { ...f, isEditing: false } : f)
                              )}
                              className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                            >
                              Done Editing
                            </button>
                          </div>
                        ) : (
                          /* View Mode */
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">{field.name}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{field.unit || "in"}</span>
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Required
                                </span>
                              )}
                            </div>
                            {field.instruction && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{field.instruction}</p>
                            )}
                            {!field.instruction || (typeof field.instruction === 'string' && field.instruction.trim() === "") ? (
                              <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Please add measurement instructions.
                              </p>
                            ) : null}
                            {field.range && (
                              <p className="text-xs text-gray-400 mt-0.5">Range: {field.range}</p>
                            )}
                            {!field.range || (typeof field.range === 'string' && field.range.trim() === "") ? (
                              <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Please add a range for this measurement.
                              </p>
                            ) : null}
                            {(!field.image || (typeof field.image === 'string' && field.image.trim() === "")) && !field.file && (
                              <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Please upload an image so users can understand how to measure this body part.
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* View/Enable Toggle - Eye */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditCustomTemplateFields(prev =>
                              prev.map((f, i) => i === index ? { ...f, enabled: !f.enabled } : f)
                            );
                          }}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${field.enabled !== false ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                          title={field.enabled !== false ? "Enabled - Click to disable" : "Disabled - Click to enable"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.enabled !== false ? "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
                          </svg>
                        </button>

                        {/* Info - (i) */}
                        <button
                          type="button"
                          onClick={() => setCustomTemplateInfoField(field)}
                          className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View instructions"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        {/* Edit - Pencil */}
                        <button
                          type="button"
                          onClick={() => {
                            // Open Edit Field Modal - store original field and file state for comparison
                            const originalFile = field.file || null;
                            setEditFieldModal({ index, field: { ...field }, originalField: { ...field } });
                            setOriginalEditFieldModalFile(originalFile);
                            setEditFieldModalFile(originalFile);
                          }}
                          className="p-1.5 rounded-full text-yellow-600 hover:bg-yellow-50 transition-colors cursor-pointer"
                          title="Edit field"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Required Toggle - Warning */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditCustomTemplateFields(prev =>
                              prev.map((f, i) => i === index ? { ...f, required: !f.required } : f)
                            );
                          }}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${field.required ? "text-red-500 hover:bg-red-50" : "text-gray-400 hover:bg-gray-100"}`}
                          title={field.required ? "Required - Click to make optional" : "Optional - Click to make required"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </button>

                        {/* Delete - Trash */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteFieldConfirm({ index, field });
                          }}
                          className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove field"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {editCustomTemplateFields.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No measurement fields defined.
                    </div>
                  )}
                </div>
                {/* Add Field Button */}

              </div>

              {/* Advanced Features */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Advanced Features</h3>

                {/* Enable Fit Preference */}
                <div className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => setEditEnableFitPrefs(!editEnableFitPrefs)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${editEnableFitPrefs ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${editEnableFitPrefs ? "translate-x-5" : ""}`} />
                  </button>
                  <span className="text-sm text-gray-700">Enable Fit Preference</span>
                </div>
                {editEnableFitPrefs && (
                  <div className="space-y-3">
                    {editCustomTemplateFitPrefs.map((fp, i) => (
                      <div key={fp.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={fp.label}
                            onChange={(e) => setEditCustomTemplateFitPrefs(prev => prev.map((f, idx) => idx === i ? { ...f, label: e.target.value } : f))}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Fit name (e.g., Slim)"
                          />
                          <input
                            type="text"
                            value={fp.allowance}
                            onChange={(e) => setEditCustomTemplateFitPrefs(prev => prev.map((f, idx) => idx === i ? { ...f, allowance: e.target.value } : f))}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Allowance (e.g., +0.5 inch)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditCustomTemplateFitPrefs(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditCustomTemplateFitPrefs(prev => [...prev, { id: Date.now(), label: "", allowance: "", enabled: true }])}
                      className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                )}
                {/* Enable Stitching Notes */}
                <div className="flex items-center gap-3 py-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setEditEnableStitchingNotes(!editEnableStitchingNotes)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${editEnableStitchingNotes ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${editEnableStitchingNotes ? "translate-x-5" : ""}`} />
                  </button>
                  <span className="text-sm text-gray-700">Enable Stitching Notes</span>
                </div>

                {/* Enable Collar Option */}
                <div className="flex items-center gap-3 py-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setEditEnableCollars(!editEnableCollars)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${editEnableCollars ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${editEnableCollars ? "translate-x-5" : ""}`} />
                  </button>
                  <span className="text-sm text-gray-700">Enable Collar Option</span>
                </div>
                {/* Collar Options (when enabled) */}
                {editEnableCollars && (
                  <div className="space-y-3">
                    {editCustomTemplateCollars.map((co, i) => (
                      <div key={co.id} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                        {/* Image Preview */}
                        <div className="group w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 relative cursor-pointer">
                          {co.image || co.file ? (
                            <>
                              <img
                                src={co.file ? URL.createObjectURL(co.file) : co.image}
                                alt={co.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-bold text-white text-center leading-tight">Change<br />Image</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="text-[9px] uppercase font-bold text-gray-400 group-hover:text-blue-600 transition-colors">Upload</span>
                            </div>
                          )}
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*"
                            title={co.image || co.file ? "Change image" : "Upload image"}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditCustomTemplateCollars(prev => prev.map((c, idx) => idx === i ? { ...c, file } : c));
                              }
                            }}
                          />
                        </div>
                        {/* Inputs */}
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={co.name}
                            onChange={(e) => setEditCustomTemplateCollars(prev => prev.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c))}
                            className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Collar name"
                          />
                          <input
                            type="text"
                            value={co.image || ""}
                            onChange={(e) => setEditCustomTemplateCollars(prev => prev.map((c, idx) => idx === i ? { ...c, image: e.target.value } : c))}
                            className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Image URL"
                          />
                          <p className="text-[11px] text-gray-400">
                            Upload image or paste URL
                          </p>
                        </div>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setEditCustomTemplateCollars(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditCustomTemplateCollars(prev => [...prev, { id: Date.now(), name: "", image: "", enabled: true }])}
                      className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                )}
              </div>





            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleTryCloseEditTemplateModal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateCustomTemplate}
                disabled={fetcher.state !== "idle" || !editCustomTemplateName.trim() || !hasEditTemplateChanges()}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${fetcher.state !== "idle" || !editCustomTemplateName.trim() || !hasEditTemplateChanges()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {fetcher.state !== "idle" ? "Updating..." : "Update Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Warning Modal for Edit Custom Template */}
      {showEditTemplateDiscardWarning && (
        <div className="fixed inset-0 bg-black/50 z-[350] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Discard Changes?</h3>
                <p className="text-sm text-gray-500">You have unsaved changes that will be lost.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditTemplateDiscardWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleCloseEditCustomTemplateModal}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Warning Modal for Edit Field */}
      {showEditFieldDiscardWarning && (
        <div className="fixed inset-0 bg-black/50 z-[450] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Discard Changes?</h3>
                <p className="text-sm text-gray-500">You have unsaved changes that will be lost.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditFieldDiscardWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleCloseEditFieldModal}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Field Confirmation Modal */}
      {deleteFieldConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[450] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteFieldConfirm(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Measurement Field</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete "{deleteFieldConfirm.field.name}"?</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone. The field will be removed from this template.</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteFieldConfirm(null)}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditCustomTemplateFields(prev => prev.filter((_, i) => i !== deleteFieldConfirm.index));
                  setDeleteFieldConfirm(null);
                }}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-red-500 border border-red-500 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal (within Edit Custom Template) */}
      {editFieldModal && (
        <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Edit Measurement Field</h2>
              <button
                type="button"
                onClick={handleTryCloseEditFieldModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5 space-y-4">
              {/* Field Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Field Name</label>
                <input
                  type="text"
                  value={editFieldModal.field.name || ""}
                  onChange={(e) => setEditFieldModal(prev => ({ ...prev, field: { ...prev.field, name: e.target.value } }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Chest"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                <select
                  value={editFieldModal.field.unit || "in"}
                  onChange={(e) => setEditFieldModal(prev => ({ ...prev, field: { ...prev.field, unit: e.target.value } }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="in">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                </select>
              </div>

              {/* Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Range</label>
                <input
                  type="text"
                  value={editFieldModal.field.range || ""}
                  onChange={(e) => {
                    // Only allow numbers, spaces, dashes, and commas
                    const value = e.target.value.replace(/[^0-9\s\-,]/g, '');
                    setEditFieldModal(prev => ({ ...prev, field: { ...prev.field, range: value } }));
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 35 - 60"
                />
              </div>

              {/* Measurement Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Measurement Instructions</label>
                <textarea
                  value={editFieldModal.field.instruction || ""}
                  onChange={(e) => setEditFieldModal(prev => ({ ...prev, field: { ...prev.field, instruction: e.target.value } }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe how to take this measurement..."
                />
              </div>

              {/* Guide Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guide Image</label>
                <div className="flex items-start gap-3">
                  {/* Image Preview */}
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    {(editFieldModalFile || editFieldModal.field.image) ? (
                      <img
                        src={editFieldModalFile ? URL.createObjectURL(editFieldModalFile) : editFieldModal.field.image}
                        alt="Guide"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setEditFieldModalFile(file);
                      }}
                    />
                  </div>
                  {/* URL Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editFieldModal.field.image || ""}
                      onChange={(e) => setEditFieldModal(prev => ({ ...prev, field: { ...prev.field, image: e.target.value } }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Click the image box to upload or paste a URL</p>
                  </div>
                </div>
              </div>

              {/* Required Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditFieldModal(prev => ({ ...prev, field: { ...prev.field, required: !prev.field.required } }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${editFieldModal.field.required ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${editFieldModal.field.required ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Required Field</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleTryCloseEditFieldModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  let finalField = { ...editFieldModal.field };

                  // Store file on field for deferred upload (will upload on Update Template)
                  if (editFieldModalFile) {
                    finalField.file = editFieldModalFile;
                    // Clear any existing image URL when a new file is uploaded
                    // The image URL will be set from the upload response when saving the template
                    finalField.image = "";
                  } else {
                    // Preserve the image URL if no new file is uploaded
                    // Ensure image is explicitly included even if it's empty
                    if (editFieldModal.field.image !== undefined) {
                      finalField.image = editFieldModal.field.image;
                    }
                  }

                  // Update field in the list
                  setEditCustomTemplateFields(prev =>
                    prev.map((f, i) => i === editFieldModal.index ? { ...f, ...finalField, isEditing: false } : f)
                  );
                  // Close modal and reset all states after saving
                  setEditFieldModal(null);
                  setEditFieldModalFile(null);
                  setOriginalEditFieldModalFile(null);
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
