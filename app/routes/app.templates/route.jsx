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

  // Fetch existing product assignments
  const assignments = await prisma.productTemplateAssignment.findMany({
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

  const products = productEdges.map((edge) => {
    const productId = edge.node.id.split("/").pop() || "";
    const assignment = assignmentMap[productId];
    return {
      id: productId,
      name: edge.node.title,
      productId: productId,
      image: edge.node.featuredImage?.url || "placeholder",
      assignedTemplateId: assignment?.templateId || null,
      assignedTemplateName: assignment?.templateName || null,
    };
  });

  return { templates, products };
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

    await prisma.template.update({
      where: { id },
      data: { isActive },
    });

    return { success: true };
  }

  if (intent === "assignProducts") {
    const templateId = formData.get("templateId");
    const productIds = JSON.parse(formData.get("productIds") || "[]");

    // 1. Unassign products that were assigned to THIS template but are NOT in the new list (Uncheck action)
    await prisma.productTemplateAssignment.deleteMany({
      where: {
        shop,
        templateId,
        productId: { notIn: productIds },
      },
    });

    // 2. Clear old assignments for the products in the new list (Re-assign/Steal action)
    await prisma.productTemplateAssignment.deleteMany({
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

    await prisma.productTemplateAssignment.createMany({
      data: assignments,
    });

    return { success: true, assignedCount: productIds.length, templateId };
  }

  return { error: "Invalid intent" };
};

export default function Templates() {
  const { templates: initialTemplates, products: shopifyProducts } = useLoaderData();
  const fetcher = useFetcher();
  const [templates, setTemplates] = useState(initialTemplates || []);
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
  const [chartColumns, setChartColumns] = useState([]);
  const [chartRows, setChartRows] = useState([]);
  const [guideImage, setGuideImage] = useState(null);
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

  // Delete confirmation state
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState(null);

  // Update templates when fetcher returns data
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.template) {
      // New template created - add to list
      const newTemplate = fetcher.data.template;
      setTemplates(prev => [{
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
      }, ...prev]);
      handleCloseCreateModal();
      setIsSaving(false);
    } else if (fetcher.data?.success && fetcher.data?.deletedId) {
      // Template deleted - remove from list
      setTemplates(prev => prev.filter(t => t.id !== fetcher.data.deletedId));
      setDeleteConfirmTemplate(null);
    } else if (fetcher.data?.success && fetcher.data?.assignedCount) {
      // Products assigned - close modal and show success
      handleCloseAssignModal();
    } else if (fetcher.data?.error) {
      setIsSaving(false);
      console.error("Error:", fetcher.data.error);
    }
  }, [fetcher.data]);

  // Sync with loader data when it changes
  useEffect(() => {
    setTemplates(initialTemplates || []);
  }, [initialTemplates]);

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

  const handleOpenAssignModal = (templateId, templateName, e) => {
    if (e) {
      e.stopPropagation();
    }
    setAssignModalTemplate({ id: templateId, name: templateName });
    setAssignSearch("");
    // Pre-select products that are already assigned to this template
    const alreadyAssigned = products
      .filter(p => p.assignedTemplateId === templateId)
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
  const handleAssignProducts = () => {
    if (!assignModalTemplate) return;

    const formData = new FormData();
    formData.append("intent", "assignProducts");
    formData.append("templateId", assignModalTemplate.id);
    formData.append("productIds", JSON.stringify(selectedProducts));

    fetcher.submit(formData, { method: "POST" });
  };

  // Create Template Modal Handlers
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setCreateStep(1);
    setSelectedGender("male");
    setSelectedCategory(null);
    setChartName("");
    setChartColumns([]);
    setChartRows([]);
    setGuideImage(null);
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
  };

  const handleRemoveColumn = (keyToRemove) => {
    if (keyToRemove === "size") return; // Don't remove size column
    setChartColumns(chartColumns.filter(col => col.key !== keyToRemove));
    setChartRows(chartRows.map(row => {
      const newRow = { ...row };
      delete newRow[keyToRemove];
      return newRow;
    }));
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
  const handleSaveTemplate = () => {
    if (!chartName.trim()) return;

    setIsSaving(true);

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
    formData.append("guideImage", guideImage || "");
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
  const handleToggleStatus = (templateId, currentStatus) => {
    const formData = new FormData();
    formData.append("intent", "toggleStatus");
    formData.append("id", templateId);
    formData.append("isActive", (!currentStatus).toString());
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
  const customTemplatesCount = 2; // Placeholder count

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
              onClick={handleOpenCreateModal}
              className="flex w-fit items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Table Template
            </button>
          </div>
        </div>

        {/* Templates Table */}
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
              {templates.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center text-gray-500 bg-white">
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
                  </td>
                </tr>
              )}
              {templates.map((template, index) => (
                <tr key={template.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index === templates.length - 1 ? 'border-b border-gray-200' : ''}`}>
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
                      <div className="relative inline-block w-10 h-5 rounded-full bg-gray-300 transition-colors duration-200">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"></div>
                      </div>

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
              {modalSubTab === "How to Measure" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">How to measure</h3>

                  <div className="flex gap-8 flex-col lg:flex-row">
                    {/* Image Placeholder */}
                    <div className="flex-1 flex justify-center items-start">
                      <div className="w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
                        {/* Mountain Icon with Sun */}
                        <svg
                          viewBox="0 0 120 80"
                          className="w-32 h-20 mb-4"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Sun */}
                          <circle cx="25" cy="20" r="8" fill="#9ca3af" opacity="0.6" />
                          <circle cx="25" cy="20" r="6" fill="#d1d5db" />

                          {/* Mountains */}
                          <path
                            d="M 20 60 L 35 40 L 45 55 L 60 30 L 75 50 L 85 35 L 100 50 L 105 45 L 110 50 L 120 60 L 20 60 Z"
                            fill="#d1d5db"
                            stroke="#9ca3af"
                            strokeWidth="1"
                          />
                          <path
                            d="M 30 60 L 40 48 L 50 55 L 60 40 L 75 52 L 85 38 L 95 50 L 110 60 L 30 60 Z"
                            fill="#e5e7eb"
                          />
                        </svg>

                        {/* Placeholder Text */}
                        <p className="text-gray-600 text-sm font-medium text-center">
                          No guide image available
                        </p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0"></span>
                          Waist
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          Wrap the tape around the narrowest part of your waist. Keep it parallel to the floor and snug but not tight.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0"></span>
                          Hip
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          Measure around the widest part of your hips and seat, keeping the tape horizontal.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-600 flex-shrink-0"></span>
                          Inseam
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          Measure from the crotch seam down to the bottom of the leg. Stand straight while taking this measurement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                                {product.assignedTemplateName && (
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
                  {createStep === 1 ? "Create Size Chart" : "Create Size Chart Details"}
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
                        onChange={(e) => setChartName(e.target.value)}
                        placeholder="Name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
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
                    </div>

                    {/* Measurement Instructions */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Add Measurement instructions <span className="text-gray-500 font-normal">(Optional)</span>
                      </h3>

                      <div className="flex gap-6 items-start">
                        {/* Guide Image */}
                        <div className="flex-shrink-0">
                          {guideImage ? (
                            <img src={guideImage} alt="Guide" className="w-56 h-auto rounded-md border border-gray-200 object-contain" />
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
                                    // Handle file upload
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // You can handle file upload here
                                    }
                                  }}
                                />
                                <span className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-block">
                                  Choose File
                                </span>
                              </label>
                              <span className="text-sm text-gray-500">No file chosen (Optional)</span>
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
                      <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={!chartName.trim() || isSaving}
                        className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${!chartName.trim() || isSaving
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"
                          }`}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
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
                      <div className="flex-shrink-0 w-56">
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
                            <p className="text-sm text-gray-500 font-medium">No guide image available</p>
                          </div>
                        )}
                      </div>

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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTemplate(deleteConfirmTemplate.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
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
