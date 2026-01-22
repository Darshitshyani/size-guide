import { useState, useRef, useEffect } from "react";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import prisma from "../../db.server";

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
      };
    }),
  };
};

export default function Dashboard() {
  const { products: initialProducts, templates, customTemplates } = useLoaderData();
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
  const [measurementInfoModal, setMeasurementInfoModal] = useState(null);
  const [selectTemplateModal, setSelectTemplateModal] = useState(null);
  const [templateTab, setTemplateTab] = useState("Table Template");
  const [templateSearch, setTemplateSearch] = useState("");
  const [viewTemplateModal, setViewTemplateModal] = useState(null); // Template object to view
  const [viewTemplateSubTab, setViewTemplateSubTab] = useState("Details");
  const [viewTemplateUnit, setViewTemplateUnit] = useState("In");
  const dropdownRefs = useRef({});
  const cancelChartsDropdownRef = useRef(null);
  const filtersModalRef = useRef(null);

  const filteredProducts = initialProducts.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.id.toLowerCase().includes(query) ||
      product.title.toLowerCase().includes(query) ||
      product.status.toLowerCase().includes(query)
    );
  });

  // Calculate chart counts
  const tableChartsCount = filteredProducts.filter(p => p.numericId % 3 === 0).length;
  const customChartsCount = filteredProducts.filter(p => p.numericId % 5 === 0).length;
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

  const handleOpenViewModal = (productId, e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log("Opening modal for product:", productId);
    setViewModalProductId(productId);
    setModalMainTab("Table Chart");
    setModalSubTab("Details");
    setModalUnit("In");
  };

  const handleCloseViewModal = () => {
    setViewModalProductId(null);
  };

  const handleOpenMeasurementInfo = (measurementName, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setMeasurementInfoModal(measurementName);
  };

  const handleCloseMeasurementInfo = () => {
    setMeasurementInfoModal(null);
  };

  const handleOpenSelectTemplate = (productId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectTemplateModal(productId);
    setTemplateTab("Table Template");
    setTemplateSearch("");
  };

  const handleCloseSelectTemplate = () => {
    setSelectTemplateModal(null);
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
                          {product.numericId % 3 === 0 ? (
                            <span className="inline-flex items-center w-fit  py-1 rounded-sm border border-yellow-400 px-4 text-xs font-medium bg-yellow-100 text-yellow-800">Not Active</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {product.numericId % 5 === 0 ? (
                            <span className="inline-flex items-center px-2.5 px-4 py-1 text-xs w-fit rounded-sm border border-green-400 font-medium bg-green-100 text-green-800">✓ Active</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5 relative">
                          {(product.numericId % 3 === 0 || product.numericId % 5 === 0) ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleOpenViewModal(product.id, e)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-100  cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleDropdown(product.id, e)}
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-500 rounded-lg hover:bg-red-200 active:bg-red-300 border border-red-300 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none"
                                >
                                  Cancel Chart
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                {openDropdownId === product.id && (
                                  <div
                                    ref={(el) => (dropdownRefs.current[product.id] = el)}
                                    className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                                    style={{ marginTop: '4px' }}
                                  >
                                    <div>
                                      <div className="cursor-pointer hover:text-red-700 hover:bg-red-50 px-4 py-2 transition-colors">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Remove Table Chart</h3>
                                        <p className="text-xs text-gray-500 ">1 chart</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveCharts(product.id)}
                                        className="w-full cursor-pointer text-left p-4 text-sm text-red-600 hover:text-red-700 hover:bg-red-50  transition-colors"
                                      >
                                        Remove All Charts (1)
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleOpenSelectTemplate(product.id, e)}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium  text-gray-600 rounded-lg hover:bg-gray-100 active:bg-gray-300 border border-gray-300 cursor-pointer  hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Set Chart
                            </button>
                          )}
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
      {viewModalProductId && (
        <div
          className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseViewModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center justify-between gap-6 flex-1">
                <h2 className="text-xl font-bold text-gray-900">Size Chart</h2>

                {/* Main Tabs */}
                <div className="flex gap-2">
                  {["Table Chart", "Custom Size"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setModalMainTab(tab)}
                      className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-lg transition-colors ${modalMainTab === tab
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

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
              {modalMainTab === "Table Chart" && modalSubTab === "Details" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart 2</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Size</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Waist ({modalUnit})</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Hip ({modalUnit})</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Inseam ({modalUnit})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "S", waist: 28, hip: 35, inseam: 33 },
                          { size: "M", waist: 30, hip: 37, inseam: 33 },
                          { size: "L", waist: 32, hip: 39, inseam: 33 },
                          { size: "XL", waist: 34, hip: 41, inseam: 33 },
                          { size: "XXL", waist: 36, hip: 43, inseam: 33 },
                          { size: "2XL", waist: 38, hip: 45, inseam: 33 },
                        ].map((row) => (
                          <tr key={row.size} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">{row.size}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">{row.waist}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">{row.hip}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">{row.inseam}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Custom Size - Details Content */}
              {modalMainTab === "Custom Size" && modalSubTab === "Details" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Measurements</h3>

                  <div className="space-y-4">
                    {/* Chest / Bust */}
                    <div className="flex items-start gap-3">

                      <div className="flex-1">
                        <label className=" flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 mb-1">
                          <span onClick={(e) => handleOpenMeasurementInfo("Chest / Bust", e)} className="cursor-pointer"> <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </div></span> Chest / Bust <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter chest / bust"
                          value={customMeasurements.chest}
                          onChange={(e) => setCustomMeasurements({ ...customMeasurements, chest: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Waist */}
                    <div className="flex items-start gap-3">

                      <div className="flex-1">
                        <label className=" flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 mb-1">
                          <span onClick={(e) => handleOpenMeasurementInfo("Waist", e)} className="cursor-pointer"> <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </div></span> Waist <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter waist"
                          value={customMeasurements.waist}
                          onChange={(e) => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Shoulder */}
                    <div className="flex items-start gap-3">

                      <div className="flex-1">
                        <label className=" flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 mb-1">
                          <span onClick={(e) => handleOpenMeasurementInfo("Shoulder", e)} className="cursor-pointer"> <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </div></span> Shoulder<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Shoulder"
                          value={customMeasurements.waist}
                          onChange={(e) => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Sleeve Length */}
                    <div className="flex items-start gap-3">

                      <div className="flex-1">
                        <label className=" flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 mb-1">
                          <span onClick={(e) => handleOpenMeasurementInfo("Sleeve Length", e)} className="cursor-pointer"> <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </div></span> Sleeve Length<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Sleeve Length"
                          value={customMeasurements.waist}
                          onChange={(e) => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Armhole */}
                    <div className="flex items-start gap-3">

                      <div className="flex-1">
                        <label className=" flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 mb-1">
                          <span onClick={(e) => handleOpenMeasurementInfo("Armhole", e)} className="cursor-pointer"> <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </div></span>  Armhole<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Armhole"
                          value={customMeasurements.waist}
                          onChange={(e) => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Length */}
                    <div className="flex items-start gap-3">

                      <div className="flex-1">
                        <label className=" flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 mb-1">
                          <span onClick={(e) => handleOpenMeasurementInfo("Length", e)} className="cursor-pointer"> <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="text-xs text-gray-600 font-semibold">i</span>
                          </div></span>  Length<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter length"
                          value={customMeasurements.length}
                          onChange={(e) => setCustomMeasurements({ ...customMeasurements, length: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>


                  </div>
                </div>
              )}

              {/* How to Measure Content - Table Chart */}
              {modalSubTab === "How to Measure" && modalMainTab === "Table Chart" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">How to measure</h3>

                  <div className="flex gap-8 flex-col lg:flex-row">
                    {/* Image Placeholder */}
                    <div className="flex-1 flex justify-center items-start">
                      <div className="w-full max-w-md  bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
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
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2 text-md">
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
                        <p className="text-gray-600 leading-relaxed  text-sm">
                          Measure from the crotch seam down to the bottom of the leg. Stand straight while taking this measurement.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-purple-600 flex-shrink-0"></span>
                          Outseam
                        </h4>
                        <p className="text-gray-600 leading-relaxed  text-sm">
                          Measure from the top of the waistband down the side of the leg to the bottom hem. Stand straight while taking this measurement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* How to Measure Content - Custom Size */}
              {modalSubTab === "How to Measure" && modalMainTab === "Custom Size" && (
                <div>
                  {/* Measurement Instructions */}
                  <div className="space-y-6">
                    {/* Chest / Bust */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Chest / Bust <span className="text-red-500">*</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo("Chest / Bust", e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        For kurta, measure around the fullest part of the chest. Kurta should have 2-3 inches of ease for comfortable fit.
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: 20 - 60 in
                      </p>
                    </div>

                    {/* Waist */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Waist <span className="text-red-500">*</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo("Waist", e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        Measure around the narrowest part of your waist. Keep it parallel to the floor and snug but not tight.
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: 20 - 60 in
                      </p>
                    </div>

                    {/* Shoulder */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Shoulder <span className="text-red-500">*</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo("Shoulder", e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        Measure from the edge of one shoulder to the edge of the other shoulder across the back.
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: 20 - 60 in
                      </p>
                    </div>

                    {/* Sleeve Length */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Sleeve Length <span className="text-red-500">*</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo("Sleeve Length", e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        Measure from the shoulder point down to where you want the sleeve to end.
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: 20 - 60 in
                      </p>
                    </div>

                    {/* Armhole */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Armhole <span className="text-red-500">*</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo("Armhole", e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        Measure around the armhole opening, ensuring the tape follows the curve of the armhole seam.
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: 20 - 60 in
                      </p>
                    </div>

                    {/* Length */}
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Length <span className="text-red-500">*</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleOpenMeasurementInfo("Length", e)}
                          className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-gray-600 font-semibold">i</span>
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        Measure from the top of the shoulder down to the desired length of the garment.
                      </p>
                      <p className="text-sm text-gray-600 border-t border-gray-300 pt-2">
                        Range: 20 - 60 in
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Measurement Info Modal */}
      {measurementInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseMeasurementInfo();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">How to Measure: {measurementInfoModal}</h2>
                <p className="text-sm text-gray-600 mt-1">Follow these instructions to get accurate measurements.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseMeasurementInfo}
                className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Guide Image Placeholder */}
                <div className="w-full flex justify-center">
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

                {/* Measurement Instructions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Measurement Instructions</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {measurementInfoModal === "Chest / Bust"
                      ? "For kurta, measure around the fullest part of the chest. Kurta should have 2-3 inches of ease for comfortable fit."
                      : measurementInfoModal === "Waist"
                        ? "Measure around the narrowest part of your waist. Keep it parallel to the floor and snug but not tight."
                        : measurementInfoModal === "Shoulder"
                          ? "Measure from the edge of one shoulder to the edge of the other shoulder across the back."
                          : measurementInfoModal === "Sleeve Length"
                            ? "Measure from the shoulder point down to where you want the sleeve to end."
                            : measurementInfoModal === "Armhole"
                              ? "Measure around the armhole opening, ensuring the tape follows the curve of the armhole seam."
                              : measurementInfoModal === "Length"
                                ? "Measure from the top of the shoulder down to the desired length of the garment."
                                : "Follow the standard measurement guidelines for this field."}
                  </p>
                </div>

                {/* Measurement Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Measurement Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Unit</span>
                      <span className="text-sm text-gray-600">Inches</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Required</span>
                      <span className="text-sm text-red-500 font-medium">Yes</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">Range</span>
                      <span className="text-sm text-gray-600">20 - 60 in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {["Table Template", "Custom Size Template"].map((tab) => (
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
                  ))}
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
                      .map((template) => (
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
                            <button
                              type="button"
                              onClick={(e) => handleOpenViewTemplate(template, e)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              + Assign Chart
                            </button>
                          </div>
                        </div>
                      ))
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
                      .map((template) => (
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
                            <button
                              type="button"
                              onClick={(e) => handleOpenViewTemplate(template, e)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              + Assign Chart
                            </button>
                          </div>
                        </div>
                      ))
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
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseViewTemplate();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {/* Icon for custom templates */}
                {viewTemplateModal.fields && !viewTemplateModal.columns && (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewTemplateModal.name}</h2>
                  {/* Subtitle for custom templates */}
                  {viewTemplateModal.fields && !viewTemplateModal.columns && (
                    <p className="text-sm text-gray-500 capitalize">
                      {viewTemplateModal.gender} • {viewTemplateModal.clothingType}
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
                    <div key={index} className="flex items-center gap-4">
                      {/* Info Icon */}
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-600 font-semibold">i</span>
                      </div>
                      {/* Field Name */}
                      <div className="w-32 flex-shrink-0">
                        <span className="text-sm font-medium text-gray-900">
                          {field.name}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                      </div>
                      {/* Input Placeholder */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Template - How to Measure Tab */}
              {viewTemplateModal.fields && !viewTemplateModal.columns && viewTemplateSubTab === "How to Measure" && (
                <div className="space-y-4">
                  {viewTemplateModal.fields.map((field, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {field.name}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </h4>
                        {field.unit && (
                          <span className="text-xs text-gray-500">{field.unit}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {field.instruction || `Enter your ${field.name.toLowerCase()} measurement.`}
                      </p>
                      {field.range && (
                        <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                          Range: {field.range}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer - for custom templates */}
            {viewTemplateModal.fields && !viewTemplateModal.columns && (
              <div className="flex justify-end p-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseViewTemplate}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
