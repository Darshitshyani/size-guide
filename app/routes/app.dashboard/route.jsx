import { useState, useRef, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import prisma from "../../db.server";

// Action handler for assigning templates to products
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "assignTemplate") {
    const templateId = formData.get("templateId");
    const templateType = formData.get("templateType"); // "table" or "custom"
    const productId = formData.get("productId");
    const templateName = formData.get("templateName");

    // Validate templateType
    if (templateType !== "table" && templateType !== "custom") {
      return { success: false, error: "Invalid template type" };
    }

    try {
      let templateData = null;

      if (templateType === "table") {
        // Remove any existing table template assignment for this product ONLY
        await prisma.productTemplateAssignment.deleteMany({
          where: { shop, productId },
        });
        // Create new table template assignment ONLY
        await prisma.productTemplateAssignment.create({
          data: {
            shop,
            productId,
            templateId,
          },
        });
        // Fetch template data
        const template = await prisma.template.findUnique({
          where: { id: templateId },
          select: { columns: true, rows: true, guideImage: true, measureDescription: true },
        });
        if (template) {
          templateData = {
            columns: JSON.parse(template.columns),
            rows: JSON.parse(template.rows),
            guideImage: template.guideImage,
            measureDescription: template.measureDescription,
          };
        }
      } else if (templateType === "custom") {
        // Remove any existing custom template assignment for this product ONLY
        await prisma.tailorTemplateAssignment.deleteMany({
          where: { shop, productId },
        });
        // Create new custom template assignment ONLY
        await prisma.tailorTemplateAssignment.create({
          data: {
            shop,
            productId,
            templateId,
          },
        });
        // Fetch template data
        const template = await prisma.tailorTemplate.findUnique({
          where: { id: templateId },
          select: { fields: true, clothingType: true, gender: true },
        });
        if (template) {
          templateData = {
            fields: typeof template.fields === "string" ? JSON.parse(template.fields) : template.fields,
            clothingType: template.clothingType,
            gender: template.gender,
          };
        }
      }

      return { 
        success: true,
        intent: "assignTemplate",
        productId, 
        templateId, 
        templateType,
        templateName,
        templateData,
        message: `Template "${templateName}" assigned successfully!`
      };
    } catch (error) {
      console.error("Error assigning template:", error);
      return { success: false, error: "Failed to assign template" };
    }
  }

  if (intent === "unassignTemplate") {
    const templateType = formData.get("templateType"); // "table" or "custom" or "all"
    const productId = formData.get("productId");

    try {
      if (templateType === "table" || templateType === "all") {
        await prisma.productTemplateAssignment.deleteMany({
          where: { shop, productId },
        });
      }
      
      if (templateType === "custom" || templateType === "all") {
        await prisma.tailorTemplateAssignment.deleteMany({
          where: { shop, productId },
        });
      }

      return { 
        success: true,
        intent: "unassignTemplate",
        productId, 
        templateType,
        message: `Chart${templateType === "all" ? "s" : ""} removed successfully!`
      };
    } catch (error) {
      console.error("Error removing template:", error);
      return { success: false, error: "Failed to remove template" };
    }
  }

  return { success: false, error: "Unknown intent" };
};

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Fetch templates from database (Table Templates)
  const dbTemplates = await prisma.template.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  const templates = dbTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    gender: template.gender,
    category: template.category,
    status: template.isActive ? "Active" : "Inactive",
    isActive: template.isActive,
    columns: JSON.parse(template.columns),
    rows: JSON.parse(template.rows),
    guideImage: template.guideImage,
    measureDescription: template.measureDescription,
  }));

  // Fetch TailorTemplates (Custom Templates)
  const dbTailorTemplates = await prisma.tailorTemplate.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  const customTemplates = dbTailorTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    gender: template.gender,
    clothingType: template.clothingType,
    status: template.isActive ? "Active" : "Inactive",
    isActive: template.isActive,
    fields: typeof template.fields === "string" ? JSON.parse(template.fields) : template.fields,
  }));

  // Fetch existing table template assignments with full template data
  const tableAssignments = await prisma.productTemplateAssignment.findMany({
    where: { shop },
    include: { 
      template: { 
        select: { 
          id: true, 
          name: true, 
          columns: true, 
          rows: true, 
          guideImage: true, 
          measureDescription: true 
        } 
      } 
    },
  });

  // Fetch existing custom template assignments with full template data
  const customAssignments = await prisma.tailorTemplateAssignment.findMany({
    where: { shop },
    include: { 
      template: { 
        select: { 
          id: true, 
          name: true, 
          fields: true,
          clothingType: true,
          gender: true
        } 
      } 
    },
  });

  // Create assignment maps with full template data
  const tableAssignmentMap = {};
  tableAssignments.forEach((a) => {
    tableAssignmentMap[a.productId] = {
      templateId: a.templateId,
      templateName: a.template.name,
      templateData: {
        columns: JSON.parse(a.template.columns),
        rows: JSON.parse(a.template.rows),
        guideImage: a.template.guideImage,
        measureDescription: a.template.measureDescription,
      },
    };
  });

  const customAssignmentMap = {};
  customAssignments.forEach((a) => {
    customAssignmentMap[a.productId] = {
      templateId: a.templateId,
      templateName: a.template.name,
      templateData: {
        fields: typeof a.template.fields === "string" ? JSON.parse(a.template.fields) : a.template.fields,
        clothingType: a.template.clothingType,
        gender: a.template.gender,
      },
    };
  });

  // Fetch products from Shopify
  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 25) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              createdAt
              status
            }
          }
        }
      }`
  );

  const responseJson = await response.json();
  const products = responseJson.data?.products?.edges || [];

  return {
    templates,
    customTemplates,
    products: products.map((edge) => {
      const productId = edge.node.id.split("/").pop() || "";
      const numericId = productId.replace(/\D/g, "") || productId;
      const tableAssignment = tableAssignmentMap[productId];
      const customAssignment = customAssignmentMap[productId];

      return {
        id: productId,
        numericId: numericId ? parseInt(numericId) : 0,
        title: edge.node.title,
        handle: edge.node.handle,
        image: edge.node.featuredImage?.url || "",
        imageAlt: edge.node.featuredImage?.altText || edge.node.title,
        date: new Date(edge.node.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: edge.node.status,
        tableTemplateId: tableAssignment?.templateId || null,
        tableTemplateName: tableAssignment?.templateName || null,
        tableTemplateData: tableAssignment?.templateData || null,
        customTemplateId: customAssignment?.templateId || null,
        customTemplateName: customAssignment?.templateName || null,
        customTemplateData: customAssignment?.templateData || null,
      };
    }),
  };
};

export default function Dashboard() {
  const { products: initialProducts, templates, customTemplates } = useLoaderData();
  const fetcher = useFetcher();
  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isCancelChartsOpen, setIsCancelChartsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [tableChartStatus, setTableChartStatus] = useState("All");
  const [customChartStatus, setCustomChartStatus] = useState("All");
  const [viewModalProductId, setViewModalProductId] = useState(null);
  const [modalMainTab, setModalMainTab] = useState("Table Chart");
  const [modalSubTab, setModalSubTab] = useState("Details");
  const [modalUnit, setModalUnit] = useState("In");
  const [customMeasurements, setCustomMeasurements] = useState({
    chest: "",
    waist: "",
    shoulder: "",
    sleeveLength: "",
    armhole: "",
    length: "",
    bottomOpening: "",
  });
  const [measurementInfoModal, setMeasurementInfoModal] = useState(null); // Can be string (name) or object (field data)
  const [selectTemplateModal, setSelectTemplateModal] = useState(null);
  const [templateTab, setTemplateTab] = useState("Table Template");
  const [templateSearch, setTemplateSearch] = useState("");
  const [restrictedTemplateType, setRestrictedTemplateType] = useState(null); // "table" or "custom" or null
  const [viewTemplateModal, setViewTemplateModal] = useState(null); // Template object to view
  const [viewTemplateSubTab, setViewTemplateSubTab] = useState("Details");
  const [viewTemplateUnit, setViewTemplateUnit] = useState("In");
  const [assigningTemplate, setAssigningTemplate] = useState(null); // Track which template is being assigned
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { productId, templateType } or null
  const dropdownRefs = useRef({});
  const cancelChartsDropdownRef = useRef(null);
  const filtersModalRef = useRef(null);

  // Sync products when initialProducts changes
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const selectedProduct =
    selectTemplateModal != null
      ? products.find((p) => p.id === selectTemplateModal)
      : null;

  // Handle assignment/unassignment success
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.productId) {
      const { productId, templateId, templateType, templateName, intent } = fetcher.data;
      
      if (intent === "assignTemplate") {
        const { templateData } = fetcher.data;
        // Update the products state with the new assignment - ONLY update the specific type
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            if (templateType === "table") {
              // Only update table template fields, preserve custom template fields
              return { 
                ...p, 
                tableTemplateId: templateId, 
                tableTemplateName: templateName, 
                tableTemplateData: templateData 
              };
            } else if (templateType === "custom") {
              // Only update custom template fields, preserve table template fields
              return { 
                ...p, 
                customTemplateId: templateId, 
                customTemplateName: templateName, 
                customTemplateData: templateData 
              };
            }
          }
          return p;
        }));
        
        // Close the modal and reset state
        setSelectTemplateModal(null);
        setAssigningTemplate(null);
        setTemplateSearch("");
      } else if (intent === "unassignTemplate") {
        // Update the products state to remove the assignment
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            if (templateType === "table") {
              return { ...p, tableTemplateId: null, tableTemplateName: null, tableTemplateData: null };
            } else if (templateType === "custom") {
              return { ...p, customTemplateId: null, customTemplateName: null, customTemplateData: null };
            } else if (templateType === "all") {
              return { ...p, tableTemplateId: null, tableTemplateName: null, tableTemplateData: null, customTemplateId: null, customTemplateName: null, customTemplateData: null };
            }
          }
          return p;
        }));
        
        // Close dropdown
        setOpenDropdownId(null);
      }
    }
  }, [fetcher.data]);

  // Handle template assignment
  const handleAssignTemplate = (template, templateType) => {
    if (!selectTemplateModal) return;
    
    setAssigningTemplate(template.id);
    
    const formData = new FormData();
    formData.append("intent", "assignTemplate");
    formData.append("templateId", template.id);
    formData.append("templateType", templateType);
    formData.append("productId", selectTemplateModal);
    formData.append("templateName", template.name);
    
    fetcher.submit(formData, { method: "POST" });
  };

  // Handle template unassignment
  const handleUnassignTemplate = (productId, templateType) => {
    const formData = new FormData();
    formData.append("intent", "unassignTemplate");
    formData.append("templateType", templateType);
    formData.append("productId", productId);
    
    fetcher.submit(formData, { method: "POST" });
  };

  // Show confirmation before unassigning templates (via custom modal)
  const handleConfirmUnassign = (productId, templateType) => {
    setDeleteConfirm({ productId, templateType });
  };

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.id.toLowerCase().includes(query) ||
      product.title.toLowerCase().includes(query) ||
      product.status.toLowerCase().includes(query)
    );
  });

  // Calculate chart counts based on actual assignments
  const tableChartsCount = filteredProducts.filter(p => p.tableTemplateId).length;
  const customChartsCount = filteredProducts.filter(p => p.customTemplateId).length;
  const totalChartsCount = tableChartsCount + customChartsCount;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleDropdown = (productId, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  };

  const handleRemoveCharts = (productId) => {
    // Handle remove charts action here
    console.log("Remove charts for product:", productId);
    setOpenDropdownId(null);
  };

  const handleToggleCancelCharts = (e) => {
    e.stopPropagation();
    setIsCancelChartsOpen(!isCancelChartsOpen);
  };

  const handleRemoveTableCharts = () => {
    // Handle remove table charts action
    console.log("Remove table charts");
    setIsCancelChartsOpen(false);
  };

  const handleRemoveCustomCharts = () => {
    // Handle remove custom charts action
    console.log("Remove custom charts");
    setIsCancelChartsOpen(false);
  };

  const handleRemoveAllCharts = () => {
    // Handle remove all charts action
    console.log("Remove all charts");
    setIsCancelChartsOpen(false);
  };

  const handleToggleFilters = (e) => {
    e.stopPropagation();
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handleTableChartStatusChange = (status) => {
    setTableChartStatus(status);
  };

  const handleCustomChartStatusChange = (status) => {
    setCustomChartStatus(status);
  };

  const handleOpenViewModal = (productId, e, preferredTab) => {
    if (e) {
      e.stopPropagation();
    }
    const product = products.find(p => p.id === productId);
    // Set initial tab based on preferredTab or available templates
    if (preferredTab) {
      setModalMainTab(preferredTab);
    } else if (product?.tableTemplateId && product?.tableTemplateData) {
      setModalMainTab("Table Chart");
    } else if (product?.customTemplateId && product?.customTemplateData) {
      setModalMainTab("Custom Size");
    } else {
      setModalMainTab("Table Chart"); // Default fallback
    }
    setViewModalProductId(productId);
    setModalSubTab("Details");
    setModalUnit("In");
  };

  const handleCloseViewModal = () => {
    setViewModalProductId(null);
  };

  const handleOpenMeasurementInfo = (measurementNameOrField, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setMeasurementInfoModal(measurementNameOrField);
  };

  const handleCloseMeasurementInfo = () => {
    setMeasurementInfoModal(null);
  };

  const handleOpenSelectTemplate = (productId, e) => {
    if (e) {
      e.stopPropagation();
    }
    // Default to Table Template tab, no restriction
    setSelectTemplateModal(productId);
    setTemplateTab("Table Template");
    setTemplateSearch("");
    setRestrictedTemplateType(null);
  };

  const handleOpenSelectTemplateForType = (productId, type, e) => {
    if (e) {
      e.stopPropagation();
    }

    setSelectTemplateModal(productId);
    setTemplateTab(type === "custom" ? "Custom Size Template" : "Table Template");
    setTemplateSearch("");
    setOpenDropdownId(null);
    // Restrict to the selected type
    setRestrictedTemplateType(type);
  };

  const handleCloseSelectTemplate = () => {
    setSelectTemplateModal(null);
    setRestrictedTemplateType(null);
  };

  const handleOpenViewTemplate = (template, e) => {
    if (e) {
      e.stopPropagation();
    }
    setViewTemplateModal(template);
    setViewTemplateSubTab("Details");
    setViewTemplateUnit("In");
  };

  const handleCloseViewTemplate = () => {
    setViewTemplateModal(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle individual product dropdowns
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        const dropdownElement = dropdownRefs.current[openDropdownId];
        if (!dropdownElement.contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
      // Handle Cancel Charts dropdown
      if (isCancelChartsOpen && cancelChartsDropdownRef.current) {
        if (!cancelChartsDropdownRef.current.contains(event.target)) {
          setIsCancelChartsOpen(false);
        }
      }
      // Handle Filters modal
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
  }, [openDropdownId, isCancelChartsOpen, isFiltersOpen]);

  return (

    <div className="w-full h-screen flex flex-col bg-white overflow-hidden">

      {/* Main Content */}
      <div className="p-4 flex flex-col flex-1 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 mb-3 flex-shrink-0 p-1 bg-gray-100 w-fit rounded-xl border border-gray-300">
          <button
            className={`px-4 py-3 font-semibold text-xs cursor-pointer border-none  text-gray-600  transition-all duration-200 relative ${activeTab === "products"
              && "text-white bg-gray-800 rounded-lg border-b-2 border-gray-800 shadow-sm"

              }`}
            onClick={() => setActiveTab("products")}
            type="button"
          >
            Products
          </button>
          <button
            className={`px-4 py-3 font-semibold text-xs cursor-pointer border-none  text-gray-600  transition-all duration-200 relative ${activeTab === "custom-orders"
              && "text-white bg-gray-800 rounded-lg border-b-2 border-gray-800 shadow-sm"

              }`}
            onClick={() => setActiveTab("custom-orders")}
            type="button"
          >
            Custom Orders
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center gap-3 mb-3 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white  focus-within:border-gray-400 focus-within:shadow-md transition-all duration-200">
            <span className="text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
              placeholder="Search by ID, name, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium  text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 border border-gray-300 cursor-pointer  hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            {isFiltersOpen && (
              <div
                ref={filtersModalRef}
                className="absolute right-0 top-full  min-w-90 bg-white  rounded-lg shadow-lg border border-gray-200 z-50"
                style={{ marginTop: '4px' }}
              >
                <div className="p-6 w-full">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Filters</h2>

                  {/* Table Chart Status Section */}
                  <div className="mb-3 w-full" >
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Table Chart Status</h3>
                    <div className="flex gap-2 flex-wrap">
                      {["All", "Active", "Not Active", "Not Assigned"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleTableChartStatusChange(status)}
                          className={`px-4 py-1.5 text-[12px] font-medium cursor-pointer rounded-full transition-colors ${tableChartStatus === status
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Chart Status Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Chart Status</h3>
                    <div className="flex gap-2 flex-wrap">
                      {["All", "Active", "Not Active", "Not Assigned"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleCustomChartStatusChange(status)}
                          className={`px-4 py-1.5 text-[12px] font-medium cursor-pointer rounded-full transition-colors ${customChartStatus === status
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleCancelCharts}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-red-100 text-red-500 rounded-lg hover:bg-red-300  border border-red-300 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none"
            >

              Cancel Charts
              <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isCancelChartsOpen && (
              <div
                ref={cancelChartsDropdownRef}
                className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                style={{ marginTop: '4px' }}
              >
                <div>
                  <div
                    onClick={handleRemoveTableCharts}
                    className="cursor-pointer hover:bg-gray-50 px-4 py-3 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Remove Table Charts</h3>
                    <p className="text-xs text-gray-500">{tableChartsCount} chart{tableChartsCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div
                    onClick={handleRemoveCustomCharts}
                    className="cursor-pointer hover:bg-gray-50 px-4 py-3 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Remove Custom Charts</h3>
                    <p className="text-xs text-gray-500">{customChartsCount} chart{customChartsCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="border-t border-gray-200 "></div>
                  <button
                    type="button"
                    onClick={handleRemoveAllCharts}
                    className="w-full cursor-pointer text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Remove All Charts ({totalChartsCount})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        {activeTab === "products" && (
          <div className="border border-gray-200 rounded-md bg-white flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse">
                <colgroup>
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '300px' }} />
                  <col style={{ width: '240px' }} />
                  <col style={{ width: '180px' }} />
                  <col style={{ width: '180px' }} />
                  <col style={{ width: '240px' }} />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer text-blue-600 border-gray-300 rounded focus:outline-none"
                        checked={
                          filteredProducts.length > 0 &&
                          selectedProducts.length === filteredProducts.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700  tracking-wider bg-gray-50 border-b border-gray-200">PRODUCT</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700  tracking-wider bg-gray-50 border-b border-gray-200">DATE</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700  tracking-wider bg-gray-50 border-b border-gray-200">TABLE CHART STATUS</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700  tracking-wider bg-gray-50 border-b border-gray-200">CUSTOM CHART STATUS</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700  tracking-wider bg-gray-50 border-b border-gray-200">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0">
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer text-blue-600  border-gray-300 rounded focus:outline-none"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.imageAlt}
                              className="w-12 h-12 object-cover rounded-md border border-gray-200"
                            />
                          )}
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">ID: {product.id}</span>
                            <span className="text-sm font-medium text-gray-900">{product.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap text-center w-fit">{product.date}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {product.tableTemplateId ? (
                            <span className="inline-flex items-center w-fit py-1 rounded-sm border border-green-400 px-4 text-xs font-medium bg-green-100 text-green-800" title={product.tableTemplateName}>
                              {product.tableTemplateName && product.tableTemplateName.length > 15 
                                ? product.tableTemplateName.substring(0, 15) + '...' 
                                : product.tableTemplateName || 'Assigned'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {product.customTemplateId ? (
                            <span className="inline-flex items-center px-4 py-1 text-xs w-fit rounded-sm border border-blue-400 font-medium bg-blue-100 text-blue-800" title={product.customTemplateName}>
                              {product.customTemplateName && product.customTemplateName.length > 15 
                                ? product.customTemplateName.substring(0, 15) + '...' 
                                : product.customTemplateName || 'Assigned'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5 relative">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => handleToggleDropdown(product.id, e)}
                              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                              </svg>
                            </button>
                            {openDropdownId === product.id && (
                              <div
                                ref={(el) => (dropdownRefs.current[product.id] = el)}
                                className="absolute right-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                                style={{ marginTop: '4px' }}
                              >
                                <div className="py-1 flex flex-col">
                                  {/* Table Chart Section */}
                                  {product.tableTemplateId ? (
                                    <>
                                      {/* View Table Chart Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          handleOpenViewModal(product.id, e, "Table Chart");
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>View Table Chart</span>
                                      </button>
                                      
                                      {/* Delete Table Chart Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleConfirmUnassign(product.id, "table");
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-1 13H8a2 2 0 01-2-2V7h12v11a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Delete Table Chart</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenSelectTemplateForType(product.id, "table", e)}
                                      className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="text-lg leading-none">+</span>
                                      <span>Set Table Chart</span>
                                    </button>
                                  )}

                                  <div className="h-px bg-gray-200 mx-4" />

                                  {/* Custom Chart Section */}
                                  {product.customTemplateId ? (
                                    <>
                                      {/* View Custom Chart Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          handleOpenViewModal(product.id, e, "Custom Size");
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>View Custom Chart</span>
                                      </button>
                                      
                                      {/* Delete Custom Chart Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleConfirmUnassign(product.id, "custom");
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-1 13H8a2 2 0 01-2-2V7h12v11a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Delete Custom Chart</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenSelectTemplateForType(product.id, "custom", e)}
                                      className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="text-lg leading-none">+</span>
                                      <span>Set Custom Chart</span>
                                    </button>
                                  )}

                                  {/* Cancel All Charts - only when both exist */}
                                  {product.tableTemplateId && product.customTemplateId && (
                                    <>
                                      <div className="h-px bg-gray-200 mx-4" />
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmUnassign(product.id, "all")}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-1 13H8a2 2 0 01-2-2V7h12v11a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Cancel All Charts</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "custom-orders" && (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-gray-500 text-base">Custom Orders coming soon...</p>
          </div>
        )}
      </div>

      {/* Size Chart Modal */}
      {viewModalProductId && (() => {
        const currentProduct = products.find(p => p.id === viewModalProductId);
        const hasTableTemplate = currentProduct?.tableTemplateId && currentProduct?.tableTemplateData;
        const hasCustomTemplate = currentProduct?.customTemplateId && currentProduct?.customTemplateData;
        const tableData = currentProduct?.tableTemplateData;
        const customData = currentProduct?.customTemplateData;
        
        // Determine available tabs based on assignments
        const availableTabs = [];
        if (hasTableTemplate) availableTabs.push("Table Chart");
        if (hasCustomTemplate) availableTabs.push("Custom Size");
        
        // Auto-select first available tab if current is not available
        const effectiveMainTab = availableTabs.includes(modalMainTab) ? modalMainTab : availableTabs[0];
        const isCustomView = effectiveMainTab === "Custom Size";
        
        return (
        <div
          className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseViewModal();
            }
          }}
        >
          <div className={`bg-white rounded-lg shadow-xl w-full ${isCustomView ? "max-w-xl" : "max-w-3xl"} max-h-[80vh] overflow-hidden flex flex-col`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                {/* Product Info */}
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{currentProduct?.title || "Product"}</h2>
                  <p className="text-sm text-gray-500">
                    {currentProduct?.customTemplateData?.gender || "Male"} • {currentProduct?.customTemplateData?.clothingType || "shirt"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Unit Toggle - only show for Table Chart */}
                {effectiveMainTab === "Table Chart" && (
                  <div className="flex gap-2">
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
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
              {/* No templates assigned */}
              {availableTabs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Assigned</h3>
                  <p className="text-gray-500 text-center">Assign a Table Chart or Custom Template to this product to view size details.</p>
                </div>
              )}

              {/* Table Chart Content */}
              {effectiveMainTab === "Table Chart" && modalSubTab === "Details" && hasTableTemplate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentProduct?.tableTemplateName}</h3>
                  {(!tableData?.columns || tableData.columns.length === 0 || !tableData?.rows || tableData.rows.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No data available for this chart.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            {tableData.columns.map((col, colIndex) => {
                              const columnLabel = col.label || col.name || "";
                              const displayLabel = colIndex > 0 
                                ? columnLabel.replace(/\(in\)|\(cm\)/gi, `(${modalUnit})`)
                                : columnLabel;
                              return (
                                <th key={col.key || colIndex} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">
                                  {displayLabel}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {tableData.columns.map((col, colIndex) => {
                                const columnKey = col.key || col.name;
                                return (
                                  <td key={col.key || colIndex} className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                                    {row[columnKey] !== undefined && row[columnKey] !== null && row[columnKey] !== "" ? row[columnKey] : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Size - Details Content */}
              {effectiveMainTab === "Custom Size" && modalSubTab === "Details" && hasCustomTemplate && (
                <div>
                  <div className="space-y-4">
                    {customData?.fields?.map((field, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-1">
                          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                            <span onClick={(e) => handleOpenMeasurementInfo(field, e)} className="cursor-pointer">
                              <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                                <span className="text-xs text-gray-600 font-semibold">i</span>
                              </div>
                            </span>
                            {field.name} {field.required !== false && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Close button at bottom */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseViewModal}
                      className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* How to Measure Content - Table Chart */}
              {modalSubTab === "How to Measure" && effectiveMainTab === "Table Chart" && hasTableTemplate && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">How to measure</h3>

                  <div className="flex gap-8 flex-col lg:flex-row">
                    {/* Image */}
                    <div className="flex-1 flex justify-center items-start">
                      {tableData?.guideImage ? (
                        <img
                          src={tableData.guideImage}
                          alt="Measurement guide"
                          className="w-full max-w-md rounded-lg shadow-md object-contain"
                        />
                      ) : (
                        <div className="w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
                          <svg
                            viewBox="0 0 120 80"
                            className="w-32 h-20 mb-4"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="25" cy="20" r="8" fill="#9ca3af" opacity="0.6" />
                            <circle cx="25" cy="20" r="6" fill="#d1d5db" />
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
                          <p className="text-gray-600 text-sm font-medium text-center">
                            No guide image available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="flex-1 space-y-6">
                      {tableData?.measureDescription ? (
                        <div 
                          className="prose prose-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: tableData.measureDescription }}
                        />
                      ) : (
                        tableData?.columns?.slice(1).map((col, index) => {
                          const colors = ["bg-blue-600", "bg-green-600", "bg-amber-600", "bg-purple-600", "bg-pink-600", "bg-indigo-600"];
                          const columnLabel = col.label || col.name || col.key || "";
                          const cleanLabel = columnLabel.replace(/\(in\)|\(cm\)/gi, "").trim();
                          return (
                            <div key={col.key || index}>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full ${colors[index % colors.length]} flex-shrink-0`}></span>
                                {cleanLabel}
                              </h4>
                              <p className="text-gray-600 leading-relaxed text-sm">
                                Measure {cleanLabel.toLowerCase()} according to standard measurement guidelines.
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* How to Measure Content - Custom Size */}
              {modalSubTab === "How to Measure" && effectiveMainTab === "Custom Size" && hasCustomTemplate && (
                <div>
                  {/* Measurement Instructions */}
                  <div className="space-y-4">
                    {customData?.fields?.map((field, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {field.name} {field.required !== false && <span className="text-red-500">*</span>}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => handleOpenMeasurementInfo(field, e)}
                            className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </button>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-2">
                          {field.instruction || `Follow the standard measurement guidelines for ${field.name.toLowerCase()}.`}
                        </p>
                        {field.range && (
                          <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                            Range: {field.range}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Measurement Info Modal */}
      {measurementInfoModal && (() => {
        // Handle both string (legacy) and object (field data) formats
        const isFieldObject = typeof measurementInfoModal === 'object' && measurementInfoModal !== null;
        const fieldName = isFieldObject ? measurementInfoModal.name : measurementInfoModal;
        const field = isFieldObject ? measurementInfoModal : null;
        
        // Get instruction text
        const getInstruction = () => {
          if (field && field.instruction) return field.instruction;
          // Fallback for legacy string-based calls
          if (fieldName === "Chest" || fieldName === "Chest / Bust") return "Measure around the fullest part of the chest.";
          if (fieldName === "Waist") return "Measure around natural waist.";
          if (fieldName === "Shoulder") return "Measure from the edge of one shoulder to the edge of the other shoulder across the back.";
          if (fieldName === "Sleeve Length") return "Measure from the shoulder point down to where you want the sleeve to end.";
          if (fieldName === "Armhole") return "Measure around the armhole opening, ensuring the tape follows the curve of the armhole seam.";
          if (fieldName === "Length") return "Measure from the top of the shoulder down to the desired length of the garment.";
          return "Follow the standard measurement guidelines for this field.";
        };

        // Get image URL - check for both null and empty string
        const imageUrl = (field?.image && field.image.trim() !== "") ? field.image : null;
        
        // Get unit
        const unit = field?.unit || "in";
        
        // Get range
        const range = field?.range || "35 - 60 in";
        
        // Get required status
        const isRequired = field?.required !== false; // Default to true if not specified

        return (
          <div
            className="fixed inset-0 bg-black/50 z-[500] flex  items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseMeasurementInfo();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-lg overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{fieldName}</h2>
                <button
                  type="button"
                  onClick={handleCloseMeasurementInfo}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 justify-center items-center overflow-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Guide Image */}
                  <div className="flex justify-center items-center">
                  <div className="w-[250px] h-[250px] shadow-lg flex justify-center rounded-lg">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`How to measure ${fieldName}`}
                        className=" rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
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
                    )}
                  </div>
                  </div>

                  {/* Measurement Instructions */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-base font-semibold text-gray-900">Instructions</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {getInstruction()}
                    </p>
                  </div>

                  {/* Measurement Details */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Measurement Details</h3>
                    <div className="space-y-0">
                      <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Unit</span>
                        <span className="text-sm text-gray-600">{unit}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Range</span>
                        <span className="text-sm text-gray-600">{range}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm font-medium text-gray-700">Required</span>
                        <span className="text-sm text-red-500 font-medium">{isRequired ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseMeasurementInfo}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Select Template Modal */}
      {selectTemplateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseSelectTemplate();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Template</h2>
                <p className="text-sm text-gray-600 mt-1">Choose a size chart template to assign to this product.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseSelectTemplate}
                className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs and Search */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex gap-2">
                  {(() => {
                    const allTabs = ["Table Template", "Custom Size Template"];
                    let availableTabs = allTabs;
                    
                    // Filter tabs based on restriction
                    if (restrictedTemplateType === "table") {
                      availableTabs = ["Table Template"];
                    } else if (restrictedTemplateType === "custom") {
                      availableTabs = ["Custom Size Template"];
                    }
                    
                    return availableTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setTemplateTab(tab)}
                        className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-lg transition-colors ${templateTab === tab
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {tab}
                      </button>
                    ));
                  })()}
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xs relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Modal Content - Template List */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                {templateTab === "Table Template" ? (
                  // Table Templates
                  templates && templates.filter(t =>
                    !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase())
                  ).length > 0 ? (
                    templates
                      .filter(t => !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                      .map((template) => {
                        const isAssignedToProduct =
                          selectedProduct && selectedProduct.tableTemplateId === template.id;
                        const isAssigningThis =
                          fetcher.state !== "idle" && assigningTemplate === template.id;

                        return (
                          <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">{template.name}</h3>
                                <div className="flex gap-2 flex-wrap">
                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">{template.gender}</span>
                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">{template.category}</span>
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${template.isActive
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                    }`}>
                                    {template.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isAssignedToProduct && (
                                <button
                                  type="button"
                                  onClick={() => handleUnassignTemplate(selectedProduct.id, "table")}
                                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Delete Chart
                                </button>
                              )}
                              {/* View Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleOpenViewTemplate({
                                    name: template.name,
                                    columns: template.columns || null,
                                    rows: template.rows || null,
                                    guideImage: template.guideImage,
                                    measureDescription: template.measureDescription,
                                    gender: template.gender,
                                    clothingType: template.category
                                  }, e);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              {/* Assign Button */}
                              <button
                                type="button"
                                onClick={(e) =>
                                  isAssignedToProduct
                                    ? handleOpenViewModal(selectedProduct.id, e)
                                    : handleAssignTemplate(template, "table")
                                }
                                disabled={!isAssignedToProduct && isAssigningThis}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                  !isAssignedToProduct && isAssigningThis
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {!isAssignedToProduct && isAssigningThis ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Assigning...
                                  </>
                                ) : (
                                  isAssignedToProduct ? "View Chart" : "+ Assign Chart"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No table templates found.</p>
                    </div>
                  )
                ) : (
                  // Custom Size Templates
                  customTemplates && customTemplates.filter(t =>
                    !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase())
                  ).length > 0 ? (
                    customTemplates
                      .filter(t => !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                      .map((template) => {
                        const isAssignedToProduct =
                          selectedProduct && selectedProduct.customTemplateId === template.id;
                        const isAssigningThis =
                          fetcher.state !== "idle" && assigningTemplate === template.id;

                        return (
                          <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">{template.name}</h3>
                                <div className="flex gap-2 flex-wrap">
                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">{template.gender}</span>
                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">{template.clothingType}</span>
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${template.isActive
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                    }`}>
                                    {template.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isAssignedToProduct && (
                                <button
                                  type="button"
                                  onClick={() => handleUnassignTemplate(selectedProduct.id, "custom")}
                                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Delete Chart
                                </button>
                              )}
                              {/* View Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleOpenViewTemplate({
                                    name: template.name,
                                    fields: template.fields || null,
                                    gender: template.gender,
                                    clothingType: template.clothingType
                                  }, e);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              {/* Assign Button */}
                              <button
                                type="button"
                                onClick={(e) =>
                                  isAssignedToProduct
                                    ? handleOpenViewModal(selectedProduct.id, e)
                                    : handleAssignTemplate(template, "custom")
                                }
                                disabled={!isAssignedToProduct && isAssigningThis}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                  !isAssignedToProduct && isAssigningThis
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {!isAssignedToProduct && isAssigningThis ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Assigning...
                                  </>
                                ) : (
                                  isAssignedToProduct ? "View Chart" : "+ Assign Chart"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No custom templates found.</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseSelectTemplate}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {viewTemplateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseViewTemplate();
            }
          }}
        >
          <div className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col ${viewTemplateModal.columns ? "max-w-3xl" : "max-w-xl"}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {/* Icon - table chart icon for table templates, shirt icon for custom */}
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {viewTemplateModal.columns ? (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.515 5l2.606-2.607a1 1 0 01.707-.293H21a1 1 0 011 1v3.172a1 1 0 01-.293.707L19 9.686V20a1 1 0 01-1 1H6a1 1 0 01-1-1V9.686L2.293 6.979A1 1 0 012 6.272V3.1a1 1 0 011-1h3.172a1 1 0 01.707.293L9.485 5h5.03z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewTemplateModal.name}</h2>
                  {/* Subtitle - show for both template types */}
                  {(viewTemplateModal.gender || viewTemplateModal.clothingType) && (
                    <p className="text-sm text-gray-500 capitalize">
                      {viewTemplateModal.gender}{viewTemplateModal.gender && viewTemplateModal.clothingType ? " • " : ""}{viewTemplateModal.clothingType}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Unit Toggle - only show for table templates with columns/rows */}
                {viewTemplateModal.columns && (
                  <div className="flex gap-1">
                    {["In", "cm"].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setViewTemplateUnit(unit)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${viewTemplateUnit === unit
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseViewTemplate}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="px-6 pt-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex gap-6">
                {["Details", "How to Measure"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setViewTemplateSubTab(tab)}
                    className={`pb-3 px-1 cursor-pointer text-sm font-medium transition-colors ${viewTemplateSubTab === tab
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Table Template - Details Tab */}
              {viewTemplateModal.columns && viewTemplateSubTab === "Details" && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {viewTemplateModal.columns.map((col) => (
                          <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">
                            {col.label} {viewTemplateUnit === "cm" && col.label.includes("(In)") ? col.label.replace("(In)", "(cm)") : ""}
                            {!col.label.includes("(In)") && !col.label.includes("(cm)") && col.key !== "size" ? ` (${viewTemplateUnit})` : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {viewTemplateModal.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {viewTemplateModal.columns.map((col) => {
                            let value = row[col.key];
                            // Convert to cm if needed (multiply by 2.54)
                            if (viewTemplateUnit === "cm" && col.key !== "size" && typeof value === "number") {
                              value = (value * 2.54).toFixed(1);
                            }
                            return (
                              <td key={col.key} className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                                {value !== undefined && value !== null ? value : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Template - How to Measure Tab */}
              {viewTemplateModal.columns && viewTemplateSubTab === "How to Measure" && (
                <div className="flex gap-8 flex-col lg:flex-row">
                  {/* Image */}
                  <div className="flex-1 flex justify-center items-start">
                    {viewTemplateModal.guideImage ? (
                      <img
                        src={viewTemplateModal.guideImage}
                        alt="How to measure"
                        className="max-w-full max-h-80 object-contain rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
                        <svg viewBox="0 0 120 80" className="w-32 h-20 mb-4" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="25" cy="20" r="8" fill="#9ca3af" opacity="0.6" />
                          <circle cx="25" cy="20" r="6" fill="#d1d5db" />
                          <path d="M 20 60 L 35 40 L 45 55 L 60 30 L 75 50 L 85 35 L 100 50 L 105 45 L 110 50 L 120 60 L 20 60 Z" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
                          <path d="M 30 60 L 40 48 L 50 55 L 60 40 L 75 52 L 85 38 L 95 50 L 110 60 L 30 60 Z" fill="#e5e7eb" />
                        </svg>
                        <p className="text-gray-600 text-sm font-medium text-center">No guide image available</p>
                      </div>
                    )}
                  </div>
                  {/* Instructions */}
                  <div className="flex-1 space-y-4">
                    {viewTemplateModal.measureDescription ? (
                      <div
                        className="text-gray-700 text-sm leading-relaxed prose prose-sm"
                        dangerouslySetInnerHTML={{ __html: viewTemplateModal.measureDescription }}
                      />
                    ) : (
                      <p className="text-gray-500 text-sm">No measurement instructions available.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Template - Details Tab - Form-like field display */}
              {viewTemplateModal.fields && !viewTemplateModal.columns && viewTemplateSubTab === "Details" && (
                <div className="space-y-4">
                  {viewTemplateModal.fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {/* Info Icon */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenMeasurementInfo(field, e)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span className="text-xs text-gray-500">i</span>
                      </button>
                      {/* Field Name */}
                      <span className="text-sm font-medium text-gray-800 w-28 flex-shrink-0">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </span>
                      {/* Input Placeholder */}
                      <input
                        type="text"
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        readOnly
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-400 text-sm cursor-default"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Template - How to Measure Tab */}
              {viewTemplateModal.fields && !viewTemplateModal.columns && viewTemplateSubTab === "How to Measure" && (
                <div className="space-y-4">
                  {viewTemplateModal.fields.map((field, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-900">
                          {field.name}
                          {field.required && <span className="text-red-500"> *</span>}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo(field, e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        {field.instruction || `Measure around the fullest part of the ${field.name.toLowerCase()}.`}
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: {field.range || "35 - 60 in"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback - No data available */}
              {!viewTemplateModal.columns && !viewTemplateModal.fields && viewTemplateSubTab === "Details" && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No template data available.</p>
                </div>
              )}
            </div>

            {/* Modal Footer - for custom templates */}
            {viewTemplateModal.fields && !viewTemplateModal.columns && (
              <div className="flex justify-end px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseViewTemplate}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (() => {
        const { productId, templateType } = deleteConfirm;
        const product = products.find(p => p.id === productId);
        const name = product?.title || "this product";

        let title = "Remove chart assignment";
        let message = `Are you sure you want to remove the chart assignment from ${name}?`;

        if (templateType === "table") {
          title = "Remove Table Chart";
          message = `Are you sure you want to remove the assigned Table Chart from ${name}?`;
        } else if (templateType === "custom") {
          title = "Remove Custom Size Chart";
          message = `Are you sure you want to remove the assigned Custom Size Chart from ${name}?`;
        } else if (templateType === "all") {
          title = "Remove All Charts";
          message = `Are you sure you want to remove all chart assignments from ${name}?`;
        }

        const handleCloseConfirm = () => setDeleteConfirm(null);

        const handleConfirm = () => {
          handleUnassignTemplate(productId, templateType);
          // If the size-chart modal is open for this product, also close it
          if (viewModalProductId === productId) {
            handleCloseViewModal();
          }
          handleCloseConfirm();
        };

        return (
          <div
            className="fixed inset-0 bg-black/40 z-[600] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseConfirm();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button
                  type="button"
                  onClick={handleCloseConfirm}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700">{message}</p>
              </div>
              <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>

  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
