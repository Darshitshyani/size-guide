import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useFetcher } from "react-router";
import prisma from "../../db.server";
import { authenticate } from "../../shopify.server";

// Predefined tailor presets with default measurement fields
const tailorPresets = [
    {
        id: "male-shirt",
        label: "Shirt",
        gender: "male",
        defaultFields: [
            { name: "Chest", unit: "in", required: true, instruction: "Measure around the fullest part of the chest.", range: "35 - 60", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/%C2%A0male+chest.png" },
            { name: "Waist", unit: "in", required: true, instruction: "Measure around natural waist.", range: "28 - 50", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+waist.png" },
            { name: "Hip", unit: "in", required: false, instruction: "Measure around the widest part of hips.", range: "35 - 60", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+hips.png" },
            { name: "Shoulder", unit: "in", required: true, instruction: "Measure shoulder to shoulder.", range: "15 - 24", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+shoulder.png" },
            { name: "Sleeve Length", unit: "in", required: false, instruction: "Measure from shoulder to wrist.", range: "20 - 40", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+full+sleeves.png" },
            { name: "Neck", unit: "in", required: false, instruction: "Measure around base of neck.", range: "10 - 20", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+nack.png" },
            { name: "Length", unit: "in", required: true, instruction: "Measure shoulder to hem.", range: "18 - 60", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+shirt+length.png" }
        ]
    },
    {
        id: "male-pants",
        label: "Pants",
        gender: "male",
        defaultFields: [
            { name: "Waist", unit: "in", required: true, instruction: "Measure waist.", range: "28 - 50", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+waist.png" },
            { name: "Hip", unit: "in", required: true, instruction: "Measure hips.", range: "35 - 60", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+hips.png" },
            { name: "Thigh", unit: "in", required: false, instruction: "Measure thigh.", range: "15 - 40", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+thigh.png" },
            { name: "Inseam", unit: "in", required: true, instruction: "Measure inseam.", range: "25 - 38", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+crotch.png" },
            { name: "Outseam", unit: "in", required: false, instruction: "Measure outseam.", range: "35 - 45", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/male+pant+length.png" }
        ]
    },
    { id: "male-custom", label: "Custom", gender: "male", defaultFields: [] },
    {
        id: "female-dress",
        label: "Dress",
        gender: "female",
        defaultFields: [
            { name: "Bust", unit: "in", required: true, instruction: "Measure bust.", range: "30 - 50", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+bust.png" },
            { name: "Waist", unit: "in", required: true, instruction: "Measure waist.", range: "24 - 45", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/femlae+waist%0D%0A%0D%0A.png" },
            { name: "Hip", unit: "in", required: true, instruction: "Measure hips.", range: "35 - 55", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+hips.png" },
            { name: "Length", unit: "in", required: true, instruction: "Measure shoulder to hem.", range: "35 - 65", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+shirt+length.png" },
            { name: "Sleeve Length", unit: "in", required: false, instruction: "Measure sleeve.", range: "4 - 24", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+sleeves.png" }
        ]
    },
    {
        id: "female-blouse",
        label: "Blouse",
        gender: "female",
        defaultFields: [
            { name: "Bust", unit: "in", required: true, instruction: "Measure bust.", range: "30 - 50", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+bust.png" },
            { name: "Under Bust", unit: "in", required: false, instruction: "Measure under bust.", range: "26 - 45", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+under+bust.png" },
            { name: "Waist", unit: "in", required: true, instruction: "Measure waist.", range: "24 - 45", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/femlae+waist%0D%0A%0D%0A.png" },
            { name: "Shoulder", unit: "in", required: true, instruction: "Measure shoulders.", range: "12 - 20", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+shoulder.png" },
            { name: "Blouse Length", unit: "in", required: true, instruction: "Measure length.", range: "12 - 24", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+shirt+length.png" },
            { name: "Sleeve Length", unit: "in", required: false, instruction: "Measure sleeve.", range: "4 - 24", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+sleeves.png" }
        ]
    },
    {
        id: "female-pants",
        label: "Pants",
        gender: "female",
        defaultFields: [
            { name: "Waist", unit: "in", required: true, instruction: "Measure waist.", range: "24 - 45", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/femlae+waist%0D%0A%0D%0A.png" },
            { name: "Hip", unit: "in", required: true, instruction: "Measure hips.", range: "35 - 55", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+hips.png" },
            { name: "Inseam", unit: "in", required: true, instruction: "Measure inseam.", range: "25 - 38", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+croch.png" },
            { name: "Outseam", unit: "in", required: false, instruction: "Measure outseam.", range: "35 - 45", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/customguideimages/female/female+pant+length.png" }
        ]
    },
    { id: "female-custom", label: "Custom", gender: "female", defaultFields: [] }
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
        fitPreferences: t.fitPreferences ? JSON.parse(t.fitPreferences) : null,
        collarOptions: t.collarOptions ? JSON.parse(t.collarOptions) : null,
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
        const fitPreferences = formData.get("fitPreferences");
        const collarOptions = formData.get("collarOptions");

        if (!name || !clothingType || !fields) return { error: "Missing required fields" };

        const template = await prisma.tailorTemplate.create({
            data: { shop, name, gender, clothingType, fields, fitPreferences, collarOptions, isActive: true },
        });
        return { success: true, template };
    }

    if (intent === "update") {
        const id = formData.get("id");
        const name = formData.get("name");
        const fields = formData.get("fields");
        const fitPreferences = formData.get("fitPreferences");

        const updateData = {};
        if (name) updateData.name = name;
        if (fields) updateData.fields = fields;
        if (fitPreferences) updateData.fitPreferences = fitPreferences;
        if (collarOptions) updateData.collarOptions = collarOptions;

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
    const [selectedGender, setSelectedGender] = useState("male");
    const [templateName, setTemplateName] = useState("");
    const [measurementFields, setMeasurementFields] = useState(tailorPresets[0].defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true })));
    const [enableFitPreference, setEnableFitPreference] = useState(false);
    const [fitPreferences, setFitPreferences] = useState([
        { id: "slim", label: "Slim", allowance: "+0.5 inch", enabled: true },
        { id: "regular", label: "Regular", allowance: "+2.0 inch", enabled: true },
        { id: "loose", label: "Loose", allowance: "+4.0 inch", enabled: true }
    ]);
    const [enableStitchingNotes, setEnableStitchingNotes] = useState(false);
    const [enableCollarOption, setEnableCollarOption] = useState(false);
    const [collarOptions, setCollarOptions] = useState([
        { id: 1, name: "Button Down Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/button+down+color.png", enabled: true },
        { id: 2, name: "Band Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/band+collar%0D%0A%0D%0A.png", enabled: true },
        { id: 3, name: "Spread Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/spread+collar.png", enabled: true }
    ]);
    const [nameError, setNameError] = useState(false);
    const [duplicateNameError, setDuplicateNameError] = useState(false);
    const [fieldsError, setFieldsError] = useState(false);
    const [collarErrors, setCollarErrors] = useState({}); // { [id]: { name: bool, image: bool } }

    // Modal states
    const [previewSelectedCollar, setPreviewSelectedCollar] = useState(null);
    const [infoModalField, setInfoModalField] = useState(null);
    const [editModalField, setEditModalField] = useState(null);
    const [editModalFile, setEditModalFile] = useState(null);
    const [assignModalTemplate, setAssignModalTemplate] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [initialSelectedProducts, setInitialSelectedProducts] = useState([]);
    const [uploadCollarIndex, setUploadCollarIndex] = useState(null);
    const [deleteConfirmField, setDeleteConfirmField] = useState(null); // Field pending deletion confirmation
    const [initialMeasurementFields, setInitialMeasurementFields] = useState(tailorPresets[0].defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true }))); // Track initial state for change detection
    const [pendingPresetChange, setPendingPresetChange] = useState(null); // Pending preset when discard warning is shown
    const [showDiscardWarning, setShowDiscardWarning] = useState(false); // Show discard changes warning for presets
    const [showEditDiscardWarning, setShowEditDiscardWarning] = useState(false); // Show discard changes warning for edit modal
    const [draggedFieldId, setDraggedFieldId] = useState(null); // Track which field is being dragged
    const [previewActiveTab, setPreviewActiveTab] = useState("details"); // "details" or "howto" for preview modal tabs

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

    // Check if there are unsaved changes by comparing current fields with initial
    const hasUnsavedChanges = () => {
        if (templateName.trim()) return true; // Has template name entered
        if (measurementFields.length !== initialMeasurementFields.length) return true;

        // Compare field properties (ignore id as it changes)
        for (let i = 0; i < measurementFields.length; i++) {
            const current = measurementFields[i];
            const initial = initialMeasurementFields[i];
            if (!initial) return true;
            if (current.name !== initial.name ||
                current.unit !== initial.unit ||
                current.required !== initial.required ||
                current.instruction !== initial.instruction ||
                current.range !== initial.range ||
                current.image !== initial.image ||
                current.enabled !== initial.enabled) {
                return true;
            }
        }
        return false;
    };

    const handlePresetChange = (preset, forceChange = false) => {
        // If forcing change (from discard modal), just apply the change
        if (forceChange) {
            const newFields = preset.defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true }));
            setSelectedPreset(preset);
            setMeasurementFields(newFields);
            setInitialMeasurementFields(newFields);
            setTemplateName("");
            return;
        }

        // Check for unsaved changes
        if (hasUnsavedChanges()) {
            setPendingPresetChange(preset);
            setShowDiscardWarning(true);
            return;
        }

        // No changes, proceed with preset change
        const newFields = preset.defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true }));
        setSelectedPreset(preset);
        setMeasurementFields(newFields);
        setInitialMeasurementFields(newFields);
    };

    const handleAddField = () => {
        setMeasurementFields([{ id: Date.now(), name: "New Field", unit: "in", required: false, instruction: "", range: "0 - 100", image: "", enabled: true }, ...measurementFields]);
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

    // Drag and drop handlers
    const handleDragStart = (e, fieldId) => {
        setDraggedFieldId(fieldId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', fieldId);
    };

    const handleDragOver = (e, fieldId) => {
        e.preventDefault();
        if (draggedFieldId === fieldId) return;

        const draggedIndex = measurementFields.findIndex(f => f.id === draggedFieldId);
        const targetIndex = measurementFields.findIndex(f => f.id === fieldId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Reorder the fields
        const newFields = [...measurementFields];
        const [draggedField] = newFields.splice(draggedIndex, 1);
        newFields.splice(targetIndex, 0, draggedField);
        setMeasurementFields(newFields);
    };

    const handleDragEnd = () => {
        setDraggedFieldId(null);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (editModalField) {
            setEditModalFile(file);
        } else if (uploadCollarIndex !== null) {
            const newCollars = [...collarOptions];
            if (newCollars[uploadCollarIndex]) {
                newCollars[uploadCollarIndex].file = file;
                setCollarOptions(newCollars);
            }
            setUploadCollarIndex(null);
        }
    };

    const handleCloseEditModal = (forceClose = false) => {
        if (forceClose) {
            setEditModalField(null);
            setEditModalFile(null);
            setShowEditDiscardWarning(false);
            return;
        }

        // Find original field
        const originalField = measurementFields.find(f => f.id === editModalField.id);
        if (!originalField) {
            setEditModalField(null);
            return;
        }

        // Check for changes
        const hasChanges =
            originalField.name !== editModalField.name ||
            originalField.unit !== editModalField.unit ||
            originalField.range !== editModalField.range ||
            originalField.instruction !== editModalField.instruction ||
            originalField.required !== editModalField.required ||
            originalField.image !== editModalField.image ||
            editModalFile !== (originalField.file || null);

        if (hasChanges) {
            setShowEditDiscardWarning(true);
        } else {
            setEditModalField(null);
            setEditModalFile(null);
        }
    };

    const handleSaveTemplate = async () => {
        setNameError(false);
        setDuplicateNameError(false);
        setFieldsError(false);
        setCollarErrors({});

        let hasValidationError = false;

        if (!templateName.trim()) {
            setNameError(true);
            hasValidationError = true;
        } else if (templates.some(t => t.name.toLowerCase() === templateName.trim().toLowerCase())) {
            setDuplicateNameError(true);
            hasValidationError = true;
        }

        const enabledFields = measurementFields.filter((f) => f.enabled);
        if (enabledFields.length === 0) {
            setFieldsError(true);
            hasValidationError = true;
        }

        if (hasValidationError) return;

        // Process collar images uploads if needed
        let finalCollarOptions = [...collarOptions];
        if (enableCollarOption) {
            const uploadPromises = finalCollarOptions.map(async (collar) => {
                if (collar.file) {
                    try {
                        const fd = new FormData();
                        fd.append("file", collar.file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) {
                            return { ...collar, image: data.url, file: undefined }; // Remove file, update image
                        }
                    } catch (e) {
                        console.error("Collar upload failed", e);
                    }
                }
                const { file, ...rest } = collar; // Ensure file is removed even if no upload
                return rest;
            });
            finalCollarOptions = await Promise.all(uploadPromises);
        }

        // Process measurement fields images uploads
        const finalMeasurementFields = await Promise.all(enabledFields.map(async (field) => {
            if (field.file) {
                try {
                    const fd = new FormData();
                    fd.append("file", field.file);
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const data = await res.json();
                    if (data.url) {
                        return { ...field, image: data.url, file: undefined };
                    }
                } catch (e) {
                    console.error("Field upload failed", e);
                }
            }
            const { file, ...rest } = field;
            return rest;
        }));

        const formData = new FormData();
        formData.append("intent", "create");
        formData.append("name", templateName);
        formData.append("gender", "Male");
        formData.append("clothingType", selectedPreset.id);
        formData.append("fields", JSON.stringify(finalMeasurementFields.map(({ id, enabled, ...rest }) => rest)));
        if (enableFitPreference) {
            formData.append("fitPreferences", JSON.stringify(fitPreferences));
        }
        if (enableCollarOption) {
            formData.append("collarOptions", JSON.stringify(finalCollarOptions));
        }

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
                        disabled={fetcher.state !== "idle"}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${fetcher.state !== "idle"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
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
                        onChange={(e) => {
                            setTemplateName(e.target.value);
                            if (e.target.value.trim()) setNameError(false);
                            setDuplicateNameError(false);
                        }}
                        className={`w-full px-4 py-3 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white ${nameError || duplicateNameError ? "border-red-500 ring-red-500 bg-red-50" : "border-gray-200"}`}
                    />
                    {nameError && <p className="mt-1 text-xs text-red-500">Template name is required</p>}
                    {duplicateNameError && <p className="mt-1 text-xs text-red-500">A template with this name already exists. Please choose a different name.</p>}
                </div>

                {/* Tailor Presets */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Tailor Presets</h2>
                    <div className="flex items-center gap-4">
                        {/* Gender Tabs */}
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            {["male", "female"].map((gender) => (
                                <button
                                    key={gender}
                                    onClick={() => {
                                        setSelectedGender(gender);
                                        // Auto-select first preset of the new gender
                                        const firstPreset = tailorPresets.find(p => p.gender === gender);
                                        if (firstPreset) {
                                            handlePresetChange(firstPreset);
                                        }
                                    }}
                                    className={`px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors cursor-pointer ${selectedGender === gender
                                        ? "bg-gray-900 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>

                        {/* Presets for selected gender */}
                        <div className="flex flex-wrap gap-2">
                            {tailorPresets.filter(p => p.gender === selectedGender).map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetChange(preset)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${selectedPreset.id === preset.id
                                        ? "bg-gray-900 text-white"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
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
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Field
                                </button>
                            </div>

                            {/* Fields Error Message */}
                            {fieldsError && (
                                <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">Please enable at least one measurement field to create a template.</p>
                                </div>
                            )}

                            {/* Fields List */}
                            <div className="divide-y divide-gray-100">
                                {measurementFields.map((field) => (
                                    <div
                                        key={field.id}
                                        className={`px-5 py-4 ${!field.enabled ? "opacity-50" : ""} ${draggedFieldId === field.id ? "bg-blue-50 opacity-70" : ""}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.id)}
                                        onDragOver={(e) => handleDragOver(e, field.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Drag Handle */}
                                            <div className="mt-1 text-gray-400 cursor-grab active:cursor-grabbing">
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
                                                {(!field.image && !field.file) && (
                                                    <div className="flex items-start gap-1.5 mt-2 text-amber-600">
                                                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <span className="text-xs">Please upload a guide image so customers can clearly understand how to measure this body part.</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                {/* Enable/Disable - Eye icon */}
                                                <button
                                                    onClick={() => handleToggleField(field.id)}
                                                    className={`p-1.5 rounded-full cursor-pointer ${field.enabled ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
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
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-blue-50 cursor-pointer"}`}
                                                    title="View info"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                {/* Edit - Pencil icon */}
                                                <button
                                                    onClick={() => {
                                                        setEditModalField({ ...field });
                                                        if (field.file) {
                                                            setEditModalFile(field.file);
                                                        }
                                                    }}
                                                    disabled={!field.enabled}
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : "text-amber-500 hover:bg-amber-50 cursor-pointer"}`}
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
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : field.required ? "text-red-500 hover:bg-red-50 cursor-pointer" : "text-gray-400 hover:bg-gray-100 cursor-pointer"}`}
                                                    title={field.required ? "Mark as optional" : "Mark as required"}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </button>
                                                {/* Delete - Trash icon */}
                                                <button
                                                    onClick={() => setDeleteConfirmField(field)}
                                                    disabled={!field.enabled}
                                                    className={`p-1.5 rounded-full ${!field.enabled ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"}`}
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

                                {enableFitPreference && (
                                    <div className="pl-8 space-y-3">
                                        {fitPreferences.map((fit, index) => (
                                            <div key={fit.id} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={fit.label}
                                                    onChange={(e) => {
                                                        const newFits = [...fitPreferences];
                                                        newFits[index].label = e.target.value;
                                                        setFitPreferences(newFits);
                                                    }}
                                                    className="w-1/3 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                                    placeholder="Label (e.g., Slim)"
                                                />
                                                <input
                                                    type="text"
                                                    value={fit.allowance}
                                                    onChange={(e) => {
                                                        const newFits = [...fitPreferences];
                                                        newFits[index].allowance = e.target.value;
                                                        setFitPreferences(newFits);
                                                    }}
                                                    className="w-1/3 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                                    placeholder="Allowance (e.g., +0.5 inch)"
                                                />
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={fit.enabled}
                                                        onChange={(e) => {
                                                            const newFits = [...fitPreferences];
                                                            newFits[index].enabled = e.target.checked;
                                                            setFitPreferences(newFits);
                                                        }}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-600">Visible</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${enableStitchingNotes ? "bg-blue-600" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableStitchingNotes ? "translate-x-5" : ""} `} />
                                    </div>
                                    <input type="checkbox" checked={enableStitchingNotes} onChange={() => setEnableStitchingNotes(!enableStitchingNotes)} className="sr-only" />
                                    <span className="text-sm text-gray-700">Enable Stitching Notes</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${enableCollarOption ? "bg-blue-600" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableCollarOption ? "translate-x-5" : ""} `} />
                                    </div>
                                    <input type="checkbox" checked={enableCollarOption} onChange={() => setEnableCollarOption(!enableCollarOption)} className="sr-only" />
                                    <span className="text-sm text-gray-700">Enable Collar Option</span>
                                </label>

                                {enableCollarOption && (
                                    <div className="pl-8 space-y-3">
                                        {collarOptions.filter(c => c.enabled).map((collar, index) => (
                                            <div key={collar.id} className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:border-gray-200 transition-colors group">
                                                {/* Image Upload Box */}
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white hover:border-blue-500 transition-colors cursor-pointer">
                                                        {(collar.file || collar.image) ? (
                                                            <img src={collar.file ? URL.createObjectURL(collar.file) : collar.image} alt={collar.name} className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="text-[10px] text-gray-400">Upload</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const formData = new FormData();
                                                                formData.append("file", file);
                                                                setUploadCollarIndex(index);
                                                                uploadFetcher.submit(formData, { method: "post", action: "/api/upload", encType: "multipart/form-data" });
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* Inputs */}
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={collar.name}
                                                        onChange={(e) => {
                                                            const newCollars = [...collarOptions];
                                                            newCollars[index].name = e.target.value;
                                                            setCollarOptions(newCollars);
                                                            if (collarErrors[collar.id]?.name && e.target.value.trim()) {
                                                                setCollarErrors(prev => ({ ...prev, [collar.id]: { ...prev[collar.id], name: false } }));
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 ${collarErrors[collar.id]?.name ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                                                        placeholder="Collar Name"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={collar.image}
                                                        onChange={(e) => {
                                                            const newCollars = [...collarOptions];
                                                            newCollars[index].image = e.target.value;
                                                            setCollarOptions(newCollars);
                                                            if (collarErrors[collar.id]?.image && e.target.value.trim()) {
                                                                setCollarErrors(prev => ({ ...prev, [collar.id]: { ...prev[collar.id], image: false } }));
                                                            }
                                                        }}
                                                        placeholder="Paste image URL or upload"
                                                        className={`w-full px-3 py-1 text-xs bg-white border rounded focus:outline-none focus:ring-1 ${collarErrors[collar.id]?.image ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"} text-gray-500`}
                                                    />
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => setCollarOptions(collarOptions.filter(c => c.id !== collar.id))}
                                                    disabled={collarOptions.length === 1}
                                                    className={`p-1.5 text-gray-400 hover:text-red-500 transition-colors ${collarOptions.length === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                                    title="Remove Option"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCollarOptions([...collarOptions, { id: Date.now(), name: "", image: "", enabled: true }])}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2 cursor-pointer"
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
                    </div>

                    {/* Right: Customer Form Preview */}
                    <div className="w-80 h-fit">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6 h-fit">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Customer Form Preview</h3>
                            <div className="border border-gray-100 rounded-lg p-6 bg-gray-50 flex flex-col items-start justify-center ">

                                <button
                                    onClick={() => setShowPreviewModal(true)}
                                    className="px-6 py-3 bg-[#1F2937] text-white text-sm font-semibold rounded shadow-sm hover:bg-gray-800 transition-colors w-full cursor-pointer"
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
                            <button onClick={() => setInfoModalField(null)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 flex flex-col items-center justify-center">
                            {infoModalField.image ? (
                                <div className="w-[250px] h-[250px] bg-gray-50 rounded-lg mb-6 overflow-hidden border border-gray-100">
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
                            <div className="mb-6 w-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-sm font-semibold text-gray-900">Measurement Instructions</h3>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{infoModalField.instruction || "No instructions provided."}</p>
                            </div>
                            <div className="w-full">
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
                <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Edit Measurement Field</h2>
                            <button onClick={() => handleCloseEditModal()} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Guide Image</label>
                                <div className="flex gap-4 items-start">
                                    {/* Image Preview Box */}
                                    <div className="relative flex-shrink-0 group">
                                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-500 transition-colors relative">
                                            {(editModalFile || editModalField.image) ? (
                                                <img src={editModalFile ? URL.createObjectURL(editModalFile) : editModalField.image} alt="Guide" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-[10px] text-gray-400 font-medium">Upload</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer text-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute top-20 mt-1 w-full text-center">Change Image</p>
                                    </div>
                                    {/* URL Input */}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={editModalField.image || ""}
                                            onChange={(e) => setEditModalField({ ...editModalField, image: e.target.value })}
                                            placeholder="Paste image URL or upload"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-400">Click the image box to upload or paste a URL</p>
                                        {uploadFetcher.state !== "idle" && <p className="text-xs text-blue-600 font-medium animate-pulse">Uploading image...</p>}
                                    </div>
                                </div>
                            </div>
                            {/* Required Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer mt-7">
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
                                onClick={() => handleCloseEditModal()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleUpdateField(editModalField.id, "name", editModalField.name);
                                    handleUpdateField(editModalField.id, "unit", editModalField.unit);
                                    handleUpdateField(editModalField.id, "range", editModalField.range);
                                    handleUpdateField(editModalField.id, "instruction", editModalField.instruction);
                                    // Store the file object in the field state for later upload
                                    if (editModalFile) {
                                        handleUpdateField(editModalField.id, "file", editModalFile);
                                    }

                                    handleUpdateField(editModalField.id, "required", editModalField.required);
                                    setEditModalField(null);
                                    setEditModalFile(null);
                                }}
                                className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer"
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
                            <button onClick={() => setAssignModalTemplate(null)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
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
                            <button onClick={() => setAssignModalTemplate(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
                            <button onClick={handleAssignProducts} disabled={fetcher.state !== "idle" || (selectedProducts.length === initialSelectedProducts.length && selectedProducts.every((id) => initialSelectedProducts.includes(id)))} className={`px-5 py-2.5 text-sm font-semibold rounded-lg ${fetcher.state !== "idle" || (selectedProducts.length === initialSelectedProducts.length && selectedProducts.every((id) => initialSelectedProducts.includes(id))) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"}`}>
                                {fetcher.state !== "idle" ? "Applying..." : "Apply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal - "Enter Your Measurements" */}
            {showPreviewModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4"
                    onClick={(e) => {
                        // Close modal on backdrop click
                        if (e.target === e.currentTarget) setShowPreviewModal(false);
                    }}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
                        onClick={() => {
                            // When clicking strictly inside the main white modal area (not on a specific input/card),
                            // we want to potentially deselect. However, catching this efficiently is hard with bubbling.
                            // simpler approach: The content area specific handler is better.
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h2 className="text-lg font-bold text-gray-900">Enter Your Measurements</h2>
                            </div>
                            <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 px-5">
                            <button
                                onClick={() => setPreviewActiveTab("details")}
                                className={`py-3 px-1 text-sm font-medium mr-6 cursor-pointer border-b-2 transition-colors ${previewActiveTab === "details"
                                    ? "text-gray-900 border-gray-900"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setPreviewActiveTab("howto")}
                                className={`py-3 px-1 text-sm font-medium cursor-pointer border-b-2 transition-colors ${previewActiveTab === "howto"
                                    ? "text-gray-900 border-gray-900"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                How to Measure
                            </button>
                        </div>

                        {/* Content */}
                        <div
                            className="flex-1 overflow-auto p-6 space-y-4"
                            onClick={(e) => {
                                // Deselect collar when clicking on empty space in the content area
                                const target = e.target;
                                const isInteractive = target.closest('input') ||
                                    target.closest('button') ||
                                    target.closest('label') ||
                                    target.closest('textarea') ||
                                    target.closest('.collar-option-card') ||
                                    target.closest('.clear-selection-btn');
                                if (!isInteractive) {
                                    setPreviewSelectedCollar(null);
                                }
                            }}
                        >
                            {/* Details Tab Content */}
                            {previewActiveTab === "details" && (
                                <>
                                    {measurementFields.filter(f => f.enabled).map((field) => (
                                        <div key={field.id} className="flex items-center gap-4">
                                            {/* Info Icon */}
                                            <div className="flex items-center gap-2 min-w-[130px]">
                                                <button
                                                    onClick={() => setInfoModalField(field)}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                                                    title="View Instructions"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>

                                                {/* Label */}
                                                <label className="text-sm font-medium text-gray-700 field-label">
                                                    {field.name} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                            </div>
                                            {/* Input */}
                                            <input
                                                type="text"
                                                placeholder={`Enter ${field.name.toLowerCase()}`}
                                                className=" w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                                            />
                                        </div>
                                    ))}
                                    {measurementFields.filter(f => f.enabled).length === 0 && (
                                        <p className="text-center text-gray-500 py-8">No measurement fields enabled for this template.</p>
                                    )}

                                    {enableFitPreference && (
                                        <div className="border-t border-gray-100 pt-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">Fit Preference</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {fitPreferences.filter(f => f.enabled).map((fit) => (
                                                    <label key={fit.id} className="cursor-pointer">
                                                        <input type="radio" name="fit_preference" className="peer sr-only" />
                                                        <div className="text-center py-2 px-1 border border-gray-200 rounded-md text-sm text-gray-600 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 transition-all hover:bg-gray-50 peer-checked:hover:bg-gray-800 flex flex-col items-center justify-center min-h-[60px]">
                                                            <span className="font-medium">{fit.label}</span>
                                                            <span className="text-[10px] opacity-70">({fit.allowance})</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {enableStitchingNotes && (
                                        <div className="border-t border-gray-100 pt-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">Stitching Notes</h3>
                                            <textarea
                                                placeholder="Add any specific instructions for stitching..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400 resize-none"
                                            />
                                        </div>
                                    )}

                                    {enableCollarOption && (
                                        <div className="border-t border-gray-100 pt-6 pb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-900">Collar Option</h3>
                                                {previewSelectedCollar !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewSelectedCollar(null)}
                                                        className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline px-2 py-1 cursor-pointer"
                                                    >
                                                        Clear Selection
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {collarOptions.filter(c => c.enabled).map((collar) => (
                                                    <div
                                                        key={collar.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent parent click handler from clearing selection
                                                            if (previewSelectedCollar === collar.id) {
                                                                setPreviewSelectedCollar(null);
                                                            } else {
                                                                setPreviewSelectedCollar(collar.id);
                                                            }
                                                        }}
                                                        className={`collar-option-card cursor-pointer border rounded-lg p-2 text-center transition-all hover:bg-gray-50 ${previewSelectedCollar === collar.id
                                                            ? 'border-gray-400 text-gray-700 bg-gray-100'
                                                            : 'border-gray-200'
                                                            }`}
                                                    >
                                                        <div className={`w-full h-24 mb-2 bg-white rounded flex items-center justify-center overflow-hidden border ${previewSelectedCollar === collar.id ? 'border-gray-300' : 'border-gray-100'
                                                            }`}>
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
                            {previewActiveTab === "howto" && (
                                <div className="space-y-4">
                                    {measurementFields.filter(f => f.enabled).map((field) => (
                                        <div
                                            key={field.id}
                                            className="bg-white border border-gray-200 rounded-lg p-4 relative"
                                        >
                                            {/* Info button */}
                                            <button
                                                onClick={() => setInfoModalField(field)}
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
                                    {measurementFields.filter(f => f.enabled).length === 0 && (
                                        <p className="text-center text-gray-500 py-8">No measurement fields enabled for this template.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#1F2937] rounded-lg hover:bg-gray-800 shadow-sm cursor-pointer"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmField && (
                <div className="fixed inset-0 bg-black/50 z-[600] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmField(null); }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-5">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Field</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Are you sure you want to delete <span className="font-medium text-gray-700">"{deleteConfirmField.name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmField(null)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleRemoveField(deleteConfirmField.id);
                                        setDeleteConfirmField(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Changes Warning Modal */}
            {showDiscardWarning && pendingPresetChange && (
                <div className="fixed inset-0 bg-black/50 z-[600] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) { setShowDiscardWarning(false); setPendingPresetChange(null); } }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-5">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Discard Changes?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                You have unsaved changes. Switching to <span className="font-medium text-gray-700">"{pendingPresetChange.label}"</span> will discard your current changes.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDiscardWarning(false);
                                        setPendingPresetChange(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Keep Editing
                                </button>
                                <button
                                    onClick={() => {
                                        handlePresetChange(pendingPresetChange, true);
                                        setShowDiscardWarning(false);
                                        setPendingPresetChange(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 cursor-pointer"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Field Discard Warning Modal */}
            {showEditDiscardWarning && (
                <div className="fixed inset-0 bg-black/50 z-[700] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-5">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Discard Changes?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                You have unsaved changes. Closing this modal will discard your current changes.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditDiscardWarning(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Keep Editing
                                </button>
                                <button
                                    onClick={() => handleCloseEditModal(true)}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 cursor-pointer"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
