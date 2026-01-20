import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useFetcher } from "react-router";
import prisma from "../../db.server";
import { authenticate } from "../../shopify.server";

// Predefined tailor presets with default measurement fields
const tailorPresets = [
    {
        id: "mens-shirt",
        label: "Men's Shirt",
        defaultFields: [
            { name: "Chest / Bust", unit: "in", required: true, instruction: "Measure around the fullest part of your chest, keeping the tape measure horizontal and parallel to the ground.", range: "35 - 60" },
            { name: "Waist", unit: "in", required: true, instruction: "Wrap the measuring tape around your torso at the smallest part of your waist. Typically this is an inch or so above your belly button.", range: "28 - 50" },
            { name: "Hip", unit: "in", required: false, instruction: "Wrap the measuring tape around the widest part of your hips and seat, keeping the tape parallel to the ground.", range: "35 - 60" },
            { name: "Shoulder", unit: "in", required: true, instruction: "Measure from the edge of one shoulder bone to the edge of the other shoulder bone, across the back.", range: "15 - 24" },
            { name: "Sleeve Length", unit: "in", required: false, instruction: "Measure from the shoulder point (where shoulder meets arm) down to your desired sleeve length (wrist, elbow, or any custom length).", range: "0 - 40" },
            { name: "Armhole", unit: "in", required: false, instruction: "Measure around the arm where it meets the shoulder, keeping the tape snug but not tight.", range: "10 - 30" },
            { name: "Neck", unit: "in", required: false, instruction: "Measure around the base of your neck where the collar would sit. Keep the tape comfortably loose.", range: "10 - 20" },
            { name: "Length", unit: "in", required: true, instruction: "Measure from the top of the garment (shoulder or neck) down to the desired bottom hem length.", range: "18 - 60" },
        ],
    },
    {
        id: "mens-kurta",
        label: "Men's Kurta",
        defaultFields: [
            { name: "Chest", unit: "in", required: true, instruction: "Measure around the fullest part of your chest.", range: "35 - 60" },
            { name: "Shoulder", unit: "in", required: true, instruction: "Measure from shoulder edge to shoulder edge.", range: "15 - 24" },
            { name: "Kurta Length", unit: "in", required: true, instruction: "Measure from shoulder to desired length.", range: "30 - 50" },
            { name: "Sleeve Length", unit: "in", required: true, instruction: "Measure from shoulder to wrist.", range: "20 - 35" },
        ],
    },
    {
        id: "womens-blouse",
        label: "Women's Blouse",
        defaultFields: [
            { name: "Bust", unit: "in", required: true, instruction: "Measure around the fullest part of your bust.", range: "30 - 50" },
            { name: "Waist", unit: "in", required: true, instruction: "Measure around your natural waistline.", range: "24 - 45" },
            { name: "Shoulder", unit: "in", required: true, instruction: "Measure from shoulder edge to edge.", range: "12 - 20" },
            { name: "Blouse Length", unit: "in", required: true, instruction: "Measure from shoulder to bottom edge.", range: "14 - 24" },
        ],
    },
    {
        id: "saree-blouse",
        label: "Saree Blouse",
        defaultFields: [
            { name: "Bust", unit: "in", required: true, instruction: "Measure around the fullest part of your bust.", range: "30 - 50" },
            { name: "Under Bust", unit: "in", required: true, instruction: "Measure just below the bust line.", range: "26 - 45" },
            { name: "Waist", unit: "in", required: true, instruction: "Measure around your natural waistline.", range: "24 - 45" },
            { name: "Shoulder", unit: "in", required: true, instruction: "Measure shoulder to shoulder.", range: "12 - 20" },
            { name: "Sleeve Length", unit: "in", required: false, instruction: "Measure from shoulder to desired length.", range: "4 - 24" },
            { name: "Blouse Length", unit: "in", required: true, instruction: "Measure from shoulder to bottom.", range: "12 - 20" },
        ],
    },
    {
        id: "pants-trouser",
        label: "Pants / Trouser",
        defaultFields: [
            { name: "Waist", unit: "in", required: true, instruction: "Measure around your natural waistline.", range: "28 - 50" },
            { name: "Hip", unit: "in", required: true, instruction: "Measure around the widest part of your hips.", range: "35 - 60" },
            { name: "Thigh", unit: "in", required: false, instruction: "Measure around the fullest part of your thigh, keeping the tape parallel to the ground.", range: "15 - 40" },
            { name: "Inseam", unit: "in", required: true, instruction: "Measure from crotch to bottom of leg.", range: "25 - 38" },
            { name: "Bottom Opening", unit: "in", required: false, instruction: "Measure the desired width of the bottom hem or opening of the garment.", range: "5 - 20" },
        ],
    },
    {
        id: "lehenga-dress",
        label: "Lehenga / Dress",
        defaultFields: [
            { name: "Bust", unit: "in", required: true, instruction: "Measure around the fullest part of your bust.", range: "30 - 50" },
            { name: "Waist", unit: "in", required: true, instruction: "Measure around your natural waistline.", range: "24 - 45" },
            { name: "Hip", unit: "in", required: true, instruction: "Measure around the widest part of your hips.", range: "35 - 55" },
            { name: "Length", unit: "in", required: true, instruction: "Measure from waist to floor.", range: "35 - 50" },
        ],
    },
    {
        id: "custom",
        label: "Custom",
        defaultFields: [
            { name: "Custom Field 1", unit: "in", required: true, instruction: "Add your custom measurement instructions here.", range: "0 - 100" },
        ],
    },
];

// Loader
export const loader = async ({ request }) => {
    const { session, admin } = await authenticate.admin(request);
    const shop = session.shop;

    const tailorTemplates = await prisma.tailorTemplate.findMany({
        where: { shop },
        orderBy: { createdAt: "desc" },
    });

    const templates = tailorTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        gender: t.gender,
        clothingType: t.clothingType,
        fields: typeof t.fields === "string" ? JSON.parse(t.fields) : t.fields,
        isActive: t.isActive,
        dateCreated: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    const response = await admin.graphql(
        `query getProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            featuredImage { url }
          }
        }
      }
    }`
    );

    const responseJson = await response.json();
    const productEdges = responseJson.data?.products?.edges || [];

    const assignments = await prisma.tailorTemplateAssignment.findMany({
        where: { shop },
        include: { template: { select: { id: true, name: true } } },
    });

    const assignmentMap = {};
    assignments.forEach((a) => {
        assignmentMap[a.productId] = { templateId: a.templateId, templateName: a.template.name };
    });

    const products = productEdges.map((edge) => {
        const productId = edge.node.id.split("/").pop() || "";
        const assignment = assignmentMap[productId];
        return {
            id: productId,
            name: edge.node.title,
            image: edge.node.featuredImage?.url || null,
            assignedTemplateId: assignment?.templateId || null,
            assignedTemplateName: assignment?.templateName || null,
        };
    });

    return { templates, products };
};

// Action
export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "create") {
        const name = formData.get("name");
        const gender = formData.get("gender") || "Male";
        const clothingType = formData.get("clothingType");
        const fields = formData.get("fields");

        if (!name || !clothingType || !fields) return { error: "Missing required fields" };

        const template = await prisma.tailorTemplate.create({
            data: { shop, name, gender, clothingType, fields, isActive: true },
        });
        return { success: true, template };
    }

    if (intent === "update") {
        const id = formData.get("id");
        const name = formData.get("name");
        const fields = formData.get("fields");

        const updateData = {};
        if (name) updateData.name = name;
        if (fields) updateData.fields = fields;

        const template = await prisma.tailorTemplate.update({ where: { id }, data: updateData });
        return { success: true, template };
    }

    if (intent === "delete") {
        const id = formData.get("id");
        await prisma.tailorTemplate.delete({ where: { id } });
        return { success: true, deletedId: id };
    }

    if (intent === "assignProducts") {
        const templateId = formData.get("templateId");
        const productIds = JSON.parse(formData.get("productIds") || "[]");

        const existingAssignments = await prisma.tailorTemplateAssignment.findMany({ where: { shop, templateId } });
        const existingProductIds = existingAssignments.map((a) => a.productId);

        const toAdd = productIds.filter((id) => !existingProductIds.includes(id));
        const toRemove = existingProductIds.filter((id) => !productIds.includes(id));

        if (toRemove.length > 0) {
            await prisma.tailorTemplateAssignment.deleteMany({ where: { shop, templateId, productId: { in: toRemove } } });
        }

        for (const productId of toAdd) {
            await prisma.tailorTemplateAssignment.upsert({
                where: { shop_productId: { shop, productId } },
                update: { templateId },
                create: { shop, productId, templateId },
            });
        }

        return { success: true, assignedCount: productIds.length, templateId };
    }

    return { error: "Invalid intent" };
};

export default function CustomTailor() {
    const { templates: initialTemplates, products: shopifyProducts } = useLoaderData();
    const fetcher = useFetcher();
    const uploadFetcher = useFetcher();

    const [templates, setTemplates] = useState(initialTemplates || []);
    const [selectedPreset, setSelectedPreset] = useState(tailorPresets[0]);
    const [templateName, setTemplateName] = useState("");
    const [measurementFields, setMeasurementFields] = useState(tailorPresets[0].defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true })));
    const [enableFitPreference, setEnableFitPreference] = useState(false);
    const [enableStitchingNotes, setEnableStitchingNotes] = useState(false);

    // Modal states
    const [infoModalField, setInfoModalField] = useState(null);
    const [editModalField, setEditModalField] = useState(null);
    const [assignModalTemplate, setAssignModalTemplate] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [initialSelectedProducts, setInitialSelectedProducts] = useState([]);

    const products = shopifyProducts || [];

    useEffect(() => {
        if (fetcher.data?.success && fetcher.data?.template) {
            const newTemplate = fetcher.data.template;
            const formattedTemplate = {
                id: newTemplate.id,
                name: newTemplate.name,
                gender: newTemplate.gender,
                clothingType: newTemplate.clothingType,
                fields: typeof newTemplate.fields === "string" ? JSON.parse(newTemplate.fields) : newTemplate.fields,
                isActive: newTemplate.isActive,
                dateCreated: new Date(newTemplate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),

            };
            setTemplates((prev) => {
                if (prev.some((t) => t.id === formattedTemplate.id)) {
                    return prev.map((t) => (t.id === formattedTemplate.id ? formattedTemplate : t));
                }
                return [formattedTemplate, ...prev];
            });
            setTemplateName("");
        } else if (fetcher.data?.success && fetcher.data?.deletedId) {
            setTemplates((prev) => prev.filter((t) => t.id !== fetcher.data.deletedId));
        } else if (fetcher.data?.success && fetcher.data?.assignedCount !== undefined) {
            setAssignModalTemplate(null);
            setSelectedProducts([]);
            setInitialSelectedProducts([]);
        }
    }, [fetcher.data]);

    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        setMeasurementFields(preset.defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true })));
    };

    const handleAddField = () => {
        setMeasurementFields([...measurementFields, { id: Date.now(), name: "New Field", unit: "in", required: false, instruction: "", range: "0 - 100", enabled: true }]);
    };

    const handleRemoveField = (fieldId) => {
        setMeasurementFields(measurementFields.filter((f) => f.id !== fieldId));
    };

    const handleToggleField = (fieldId) => {
        setMeasurementFields(measurementFields.map((f) => (f.id === fieldId ? { ...f, enabled: !f.enabled } : f)));
    };

    const handleToggleRequired = (fieldId) => {
        setMeasurementFields(measurementFields.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f)));
    };

    const handleUpdateField = (id, key, value) => {
        setMeasurementFields(prev => prev.map(field => field.id === id ? { ...field, [key]: value } : field));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            uploadFetcher.submit(formData, { method: "post", action: "/api/upload", encType: "multipart/form-data" });
        }
    };

    useEffect(() => {
        if (uploadFetcher.state === "idle" && uploadFetcher.data?.url && editModalField) {
            setEditModalField(prev => prev ? ({ ...prev, image: uploadFetcher.data.url }) : null);
        }
    }, [uploadFetcher.data, uploadFetcher.state]);

    const handleSaveTemplate = () => {
        if (!templateName.trim()) return;
        const enabledFields = measurementFields.filter((f) => f.enabled);
        if (enabledFields.length === 0) return;

        const formData = new FormData();
        formData.append("intent", "create");
        formData.append("name", templateName);
        formData.append("gender", "Male");
        formData.append("clothingType", selectedPreset.id);
        formData.append("fields", JSON.stringify(enabledFields.map(({ id, enabled, ...rest }) => rest)));
        fetcher.submit(formData, { method: "POST" });
    };

    const handleOpenAssignModal = (template) => {
        setAssignModalTemplate(template);
        const alreadyAssigned = products.filter((p) => p.assignedTemplateId === template.id).map((p) => p.id);
        setSelectedProducts(alreadyAssigned);
        setInitialSelectedProducts(alreadyAssigned);
    };

    const handleAssignProducts = () => {
        if (!assignModalTemplate) return;
        const formData = new FormData();
        formData.append("intent", "assignProducts");
        formData.append("templateId", assignModalTemplate.id);
        formData.append("productIds", JSON.stringify(selectedProducts));
        fetcher.submit(formData, { method: "POST" });
    };

    const enabledFieldsCount = measurementFields.filter((f) => f.enabled).length;

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Header */}
            <div className="p-6">
                {/* Title Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Measurement Template Builder</h1>
                        <p className="text-sm text-gray-500">Create custom measurement templates for made-to-order clothing</p>
                    </div>
                    <button
                        onClick={handleSaveTemplate}
                        disabled={!templateName.trim() || enabledFieldsCount === 0 || fetcher.state !== "idle"}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${!templateName.trim() || enabledFieldsCount === 0 || fetcher.state !== "idle"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                    >
                        {fetcher.state !== "idle" ? "Creating..." : "Create Template"}
                    </button>
                </div>

                {/* Template Name Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="New Measurement Template"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                </div>

                {/* Tailor Presets */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Tailor Presets</h2>
                    <div className="flex flex-wrap gap-2">
                        {tailorPresets.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handlePresetChange(preset)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedPreset.id === preset.id
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Left: Measurement Fields */}
                    <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">Measurement Fields</h3>
                                <button
                                    onClick={handleAddField}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Field
                                </button>
                            </div>

                            {/* Fields List */}
                            <div className="divide-y divide-gray-100">
                                {measurementFields.map((field) => (
                                    <div key={field.id} className={`px-5 py-4 ${!field.enabled ? "opacity-50" : ""}`}>
                                        <div className="flex items-start gap-3">
                                            {/* Drag Handle */}
                                            <div className="mt-1 text-gray-400 cursor-move">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                                                </svg>
                                            </div>

                                            {/* Field Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">{field.name}</span>
                                                    <span className="px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">{field.unit}</span>
                                                    {field.required && (
                                                        <span className="px-1.5 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded">Required</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mb-1 line-clamp-2">{field.instruction}</p>
                                                <p className="text-xs text-gray-400">Range: {field.range} {field.unit}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                {/* Enable/Disable - Eye icon */}
                                                <button
                                                    onClick={() => handleToggleField(field.id)}
                                                    className={`p-1.5 rounded-full ${field.enabled ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                                                    title={field.enabled ? "Disable field" : "Enable field"}
                                                >
                                                    {field.enabled ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    )}
                                                </button>
                                                {/* Info - Info icon */}
                                                <button
                                                    onClick={() => setInfoModalField(field)}
                                                    disabled={!field.enabled}
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-blue-50"}`}
                                                    title="View info"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                {/* Edit - Pencil icon */}
                                                <button
                                                    onClick={() => setEditModalField({ ...field })}
                                                    disabled={!field.enabled}
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : "text-amber-500 hover:bg-amber-50"}`}
                                                    title="Edit field"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                {/* Required - Exclamation icon */}
                                                <button
                                                    onClick={() => handleToggleRequired(field.id)}
                                                    disabled={!field.enabled}
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : field.required ? "text-red-500 hover:bg-red-50" : "text-gray-400 hover:bg-gray-100"}`}
                                                    title={field.required ? "Mark as optional" : "Mark as required"}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </button>
                                                {/* Delete - Trash icon */}
                                                <button
                                                    onClick={() => handleRemoveField(field.id)}
                                                    disabled={!field.enabled}
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                                                    title="Delete field"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Features */}
                        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Advanced Features</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${enableFitPreference ? "bg-blue-600" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableFitPreference ? "translate-x-5" : ""}`} />
                                    </div>
                                    <input type="checkbox" checked={enableFitPreference} onChange={() => setEnableFitPreference(!enableFitPreference)} className="sr-only" />
                                    <span className="text-sm text-gray-700">Enable Fit Preference</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${enableStitchingNotes ? "bg-blue-600" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableStitchingNotes ? "translate-x-5" : ""} `} />
                                    </div>
                                    <input type="checkbox" checked={enableStitchingNotes} onChange={() => setEnableStitchingNotes(!enableStitchingNotes)} className="sr-only" />
                                    <span className="text-sm text-gray-700">Enable Stitching Notes</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right: Customer Form Preview */}
                    <div className="w-80 h-fit">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6 h-fit">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Customer Form Preview</h3>
                            <div className="border border-gray-100 rounded-lg p-6 bg-gray-50 flex flex-col items-start justify-center ">

                                <button
                                    onClick={() => setShowPreviewModal(true)}
                                    className="px-6 py-3 bg-[#1F2937] text-white text-sm font-semibold rounded shadow-sm hover:bg-gray-800 transition-colors w-full"
                                >
                                    Custom order
                                </button>
                            </div>


                        </div>
                    </div>
                </div>


            </div>

            {/* Info Modal */}
            {infoModalField && (
                <div className="fixed inset-0 bg-black/50 z-[500] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setInfoModalField(null); }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">How to Measure: {infoModalField.name}</h2>
                                <p className="text-xs text-gray-500">Follow these instructions to get accurate measurements.</p>
                            </div>
                            <button onClick={() => setInfoModalField(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5">
                            {infoModalField.image ? (
                                <div className="w-full h-40 bg-gray-50 rounded-lg mb-6 overflow-hidden border border-gray-100">
                                    <img src={infoModalField.image} alt={infoModalField.name} className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center mb-6">
                                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-400">No guide image available</span>
                                </div>
                            )}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-sm font-semibold text-gray-900">Measurement Instructions</h3>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{infoModalField.instruction || "No instructions provided."}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Measurement Details</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Unit</span>
                                        <span className="text-sm font-medium text-gray-900">{infoModalField.unit === "in" ? "Inches" : "Centimeters"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Required</span>
                                        <span className={`text-sm font-medium ${infoModalField.required ? "text-red-500" : "text-gray-500"}`}>{infoModalField.required ? "Yes" : "No"}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-sm text-gray-600">Range</span>
                                        <span className="text-sm font-medium text-gray-900">{infoModalField.range} {infoModalField.unit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Field Modal */}
            {editModalField && (
                <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setEditModalField(null); }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Edit Measurement Field</h2>
                            <button onClick={() => setEditModalField(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Field Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                                <input
                                    type="text"
                                    value={editModalField.name}
                                    onChange={(e) => setEditModalField({ ...editModalField, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select
                                    value={editModalField.unit}
                                    onChange={(e) => setEditModalField({ ...editModalField, unit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="in">Inches (in)</option>
                                    <option value="cm">Centimeters (cm)</option>
                                </select>
                            </div>
                            {/* Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Range</label>
                                <input
                                    type="text"
                                    value={editModalField.range}
                                    onChange={(e) => setEditModalField({ ...editModalField, range: e.target.value })}
                                    placeholder="e.g., 20 - 60"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {/* Instruction */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Instructions</label>
                                <textarea
                                    value={editModalField.instruction}
                                    onChange={(e) => setEditModalField({ ...editModalField, instruction: e.target.value })}
                                    placeholder="Describe how to take this measurement..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guide Image (URL or Upload)</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={editModalField.image || ""}
                                        onChange={(e) => setEditModalField({ ...editModalField, image: e.target.value })}
                                        placeholder="https://example.com/image.png"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 rounded-md border border-gray-300 transition-colors" title="Upload Image">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                                {uploadFetcher.state !== "idle" && <p className="text-xs text-blue-600 mt-1 font-medium animate-pulse">Uploading image...</p>}
                            </div>
                            {/* Required Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`relative w-10 h-5 rounded-full transition-colors ${editModalField.required ? "bg-blue-600" : "bg-gray-200"}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editModalField.required ? "translate-x-5" : ""}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={editModalField.required}
                                    onChange={() => setEditModalField({ ...editModalField, required: !editModalField.required })}
                                    className="sr-only"
                                />
                                <span className="text-sm text-gray-700">Required Field</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setEditModalField(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleUpdateField(editModalField.id, "name", editModalField.name);
                                    handleUpdateField(editModalField.id, "unit", editModalField.unit);
                                    handleUpdateField(editModalField.id, "range", editModalField.range);
                                    handleUpdateField(editModalField.id, "instruction", editModalField.instruction);
                                    handleUpdateField(editModalField.id, "image", editModalField.image);
                                    handleUpdateField(editModalField.id, "required", editModalField.required);
                                    setEditModalField(null);
                                    setEditModalField(null);
                                }}
                                className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {assignModalTemplate && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setAssignModalTemplate(null); }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Assign to Products</h2>
                                <p className="text-sm text-gray-500">Template: {assignModalTemplate.name}</p>
                            </div>
                            <button onClick={() => setAssignModalTemplate(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-5">
                            {products.map((product) => (
                                <label key={product.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-2 ${selectedProducts.includes(product.id) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                                    <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => setSelectedProducts(selectedProducts.includes(product.id) ? selectedProducts.filter((id) => id !== product.id) : [...selectedProducts, product.id])} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                                    {product.image && <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />}
                                    <span className="text-sm font-medium text-gray-900 flex-1">{product.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
                            <button onClick={() => setAssignModalTemplate(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleAssignProducts} disabled={fetcher.state !== "idle" || (selectedProducts.length === initialSelectedProducts.length && selectedProducts.every((id) => initialSelectedProducts.includes(id)))} className={`px-5 py-2.5 text-sm font-semibold rounded-lg ${fetcher.state !== "idle" || (selectedProducts.length === initialSelectedProducts.length && selectedProducts.every((id) => initialSelectedProducts.includes(id))) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
                                {fetcher.state !== "idle" ? "Applying..." : "Apply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal - "Enter Your Measurements" */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowPreviewModal(false); }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h2 className="text-lg font-bold text-gray-900">Enter Your Measurements</h2>
                            </div>
                            <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 px-5">
                            <button className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-gray-900 mr-6">Details</button>
                            <button className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">How to Measure</button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-6 space-y-6">
                            {measurementFields.filter(f => f.enabled).map((field) => (
                                <div key={field.id} className="grid grid-cols-[24px_1fr_1fr] items-center gap-4">
                                    {/* Info Icon */}
                                    <button
                                        onClick={() => setInfoModalField(field)}
                                        className="text-gray-400 hover:text-blue-500 transition-colors"
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

                                    {/* Input */}
                                    <input
                                        type="text"
                                        placeholder={`Enter ${field.name.toLowerCase()}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            ))}
                            {measurementFields.filter(f => f.enabled).length === 0 && (
                                <p className="text-center text-gray-500 py-8">No measurement fields enabled for this template.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#1F2937] rounded-lg hover:bg-gray-800 shadow-sm"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
