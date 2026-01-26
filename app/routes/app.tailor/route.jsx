import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useFetcher, useNavigate } from "react-router";
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

    // Parse edit query parameter
    const url = new URL(request.url);
    const editTemplateId = url.searchParams.get("edit");

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

    // Find the template to edit if edit query param is present
    let editingTemplate = null;
    if (editTemplateId) {
        editingTemplate = templates.find(t => t.id === editTemplateId) || null;
    }

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

    return { templates, products, editingTemplate };
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
        const enableStitchingNotes = formData.get("enableStitchingNotes") === "true";
        const customFeatures = formData.get("customAdvancedFeatures");

        if (!name || !clothingType || !fields) return { error: "Missing required fields" };

        const template = await prisma.tailorTemplate.create({
            data: { shop, name, gender, clothingType, fields, fitPreferences, collarOptions, enableStitchingNotes, customFeatures, isActive: true },
        });
        return { success: true, template };
    }

    if (intent === "update") {
        const id = formData.get("id");
        const name = formData.get("name");
        const fields = formData.get("fields");
        const fitPreferences = formData.get("fitPreferences");
        const collarOptions = formData.get("collarOptions");
        const enableStitchingNotes = formData.get("enableStitchingNotes");
        const customFeatures = formData.get("customAdvancedFeatures");

        const updateData = {};
        if (name) updateData.name = name;
        if (fields) updateData.fields = fields;
        if (fitPreferences) updateData.fitPreferences = fitPreferences;
        if (collarOptions) updateData.collarOptions = collarOptions;
        if (enableStitchingNotes !== null) updateData.enableStitchingNotes = enableStitchingNotes === "true";
        if (customFeatures !== null) updateData.customFeatures = customFeatures;

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
    const { templates: initialTemplates, products: shopifyProducts, editingTemplate } = useLoaderData();
    const fetcher = useFetcher();
    const uploadFetcher = useFetcher();
    const navigate = useNavigate();

    // Maximum file size: 2MB
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    const [templates, setTemplates] = useState(initialTemplates || []);
    const [selectedPreset, setSelectedPreset] = useState(tailorPresets[0]);
    const [selectedGender, setSelectedGender] = useState("male");
    const [templateName, setTemplateName] = useState("");
    const [measurementFields, setMeasurementFields] = useState(tailorPresets[0].defaultFields.map((f, i) => ({ id: Date.now() + i, ...f, enabled: true })));
    const [enableFitPreference, setEnableFitPreference] = useState(false);
    const [fitPreferenceRequired, setFitPreferenceRequired] = useState(false);
    const [fitPreferences, setFitPreferences] = useState([
        { id: "slim", label: "Slim", allowance: "+0.5 inch", enabled: true },
        { id: "regular", label: "Regular", allowance: "+2.0 inch", enabled: true },
        { id: "loose", label: "Loose", allowance: "+4.0 inch", enabled: true }
    ]);
    const [enableStitchingNotes, setEnableStitchingNotes] = useState(false);
    const [stitchingNotesRequired, setStitchingNotesRequired] = useState(false);
    const [enableCollarOption, setEnableCollarOption] = useState(false);
    const [collarOptionRequired, setCollarOptionRequired] = useState(false);
    const [collarOptions, setCollarOptions] = useState([
        { id: 1, name: "Button Down Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/button+down+color.png", enabled: true },
        { id: 2, name: "Band Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/band+collar%0D%0A%0D%0A.png", enabled: true },
        { id: 3, name: "Spread Collar", image: "https://sizechartimages.s3.ap-south-1.amazonaws.com/images/collars/spread+collar.png", enabled: true }
    ]);
    const [customAdvancedFeatures, setCustomAdvancedFeatures] = useState([]);
    const [newCustomFeatureName, setNewCustomFeatureName] = useState("");
    const [deleteCustomFeatureConfirm, setDeleteCustomFeatureConfirm] = useState(null); // Feature pending deletion
    const [previewSelectedCustomOptions, setPreviewSelectedCustomOptions] = useState({}); // { featureId: optionId }
    const [nameError, setNameError] = useState(false);
    const [duplicateNameError, setDuplicateNameError] = useState(false);
    const [fieldsError, setFieldsError] = useState(false);
    const [collarErrors, setCollarErrors] = useState({}); // { [id]: { name: bool, image: bool } }
    const [customFeaturesErrors, setCustomFeaturesErrors] = useState({}); // { [featureId]: { [optionId]: { name: bool, image: bool } } }
    
    // Custom preset visibility options
    const [showMeasurementFields, setShowMeasurementFields] = useState(true);
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
    const [visibilityError, setVisibilityError] = useState(false);

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState(null);

    // Modal states
    const [previewSelectedCollar, setPreviewSelectedCollar] = useState(null);
    const [infoModalField, setInfoModalField] = useState(null);
    const [editModalField, setEditModalField] = useState(null);
    const [editModalFile, setEditModalFile] = useState(null);
    const [editModalFileError, setEditModalFileError] = useState(""); // File size error for edit modal
    const [originalEditModalField, setOriginalEditModalField] = useState(null); // Store original field state when modal opens
    const [originalEditModalFile, setOriginalEditModalFile] = useState(null); // Store original file state when modal opens
    const [addFieldModal, setAddFieldModal] = useState(null); // New field data when adding
    const [addFieldFile, setAddFieldFile] = useState(null); // File for new field image upload
    const [addFieldErrors, setAddFieldErrors] = useState({}); // Validation errors for add field modal
    const [collarFileErrors, setCollarFileErrors] = useState({}); // File size errors for collar options { [index]: error }
    const [showAddFieldDiscardWarning, setShowAddFieldDiscardWarning] = useState(false); // Discard warning for add field modal
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
    const [previewSelectedFit, setPreviewSelectedFit] = useState(null); // Selected fit preference in preview modal
    const [previewCurrentStep, setPreviewCurrentStep] = useState(0); // Current step in measurement flow
    const [previewMeasurementValues, setPreviewMeasurementValues] = useState({}); // Store measurement values { fieldId: value }
    const [previewStitchingNotes, setPreviewStitchingNotes] = useState(""); // Stitching notes value

    const products = shopifyProducts || [];

    // Load template data when in edit mode
    useEffect(() => {
        if (editingTemplate) {
            setIsEditMode(true);
            setEditingTemplateId(editingTemplate.id);
            setTemplateName(editingTemplate.name);

            // Set gender and preset
            const gender = editingTemplate.gender?.toLowerCase() || "male";
            setSelectedGender(gender);
            const preset = tailorPresets.find(p => p.id === editingTemplate.clothingType) || tailorPresets.find(p => p.gender === gender) || tailorPresets[0];
            setSelectedPreset(preset);

            // Set measurement fields
            const fields = (editingTemplate.fields || []).map((f, i) => ({ id: Date.now() + i, ...f, enabled: true }));
            setMeasurementFields(fields);
            setInitialMeasurementFields(fields);

            // Set fit preferences
            if (editingTemplate.fitPreferences && editingTemplate.fitPreferences.length > 0) {
                setEnableFitPreference(true);
                setFitPreferences(editingTemplate.fitPreferences);
            }

            // Set collar options
            if (editingTemplate.collarOptions && editingTemplate.collarOptions.length > 0) {
                setEnableCollarOption(true);
                setCollarOptions(editingTemplate.collarOptions);
            }
        }
    }, [editingTemplate]);

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

            // Redirect to templates page with custom tab after creating/editing
            navigate("/app/templates?tab=custom");
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
            // Reset visibility options for Custom preset
            setShowMeasurementFields(true);
            setShowAdvancedFeatures(true);
            setVisibilityError(false);
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
        // Reset visibility options for Custom preset
        setShowMeasurementFields(true);
        setShowAdvancedFeatures(true);
        setVisibilityError(false);
    };

    const handleAddField = () => {
        // Open add field modal with default values
        setAddFieldModal({
            name: "",
            unit: "in",
            required: false,
            instruction: "",
            range: "",
            image: "",
            enabled: true
        });
        setAddFieldFile(null);
        setAddFieldErrors({});
    };

    const validateAddFieldForm = () => {
        const errors = {};
        
        // Field Name validation
        if (!addFieldModal.name || addFieldModal.name.trim() === "") {
            errors.name = "Field name is required";
        }
        
        // Unit validation
        if (!addFieldModal.unit || addFieldModal.unit.trim() === "") {
            errors.unit = "Unit is required";
        }
        
        // Range validation
        if (!addFieldModal.range || addFieldModal.range.trim() === "") {
            errors.range = "Range is required";
        }
        
        // Measurement Instructions validation
        if (!addFieldModal.instruction || addFieldModal.instruction.trim() === "") {
            errors.instruction = "Measurement instructions are required";
        }
        
        // Guide Image validation - either file or URL must be provided
        if (!addFieldFile && (!addFieldModal.image || addFieldModal.image.trim() === "")) {
            errors.image = "Guide image is required (upload or paste URL)";
        }
        
        setAddFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNewField = () => {
        if (!addFieldModal) return;
        
        // Validate all fields
        if (!validateAddFieldForm()) {
            return;
        }
        
        // Create new field with unique ID
        const newField = {
            id: Date.now(),
            ...addFieldModal,
            file: addFieldFile || null
        };
        
        // Add to beginning of measurementFields
        setMeasurementFields([newField, ...measurementFields]);
        
        // Close modal and reset states
        setAddFieldModal(null);
        setAddFieldFile(null);
        setAddFieldErrors({});
    };

    const handleAddFieldFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                setAddFieldErrors(prev => ({ ...prev, image: `Image size must be less than 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }));
                setAddFieldFile(null);
                // Reset file input
                event.target.value = "";
                return;
            }
            setAddFieldFile(file);
            // Clear image error when file is uploaded
            if (addFieldErrors.image) {
                setAddFieldErrors(prev => ({ ...prev, image: "" }));
            }
        }
    };

    const handleCloseAddFieldModal = (forceClose = false) => {
        if (forceClose) {
            setAddFieldModal(null);
            setAddFieldFile(null);
            setAddFieldErrors({});
            setShowAddFieldDiscardWarning(false);
            return;
        }

        if (!addFieldModal) {
            return;
        }

        // Check if any field has been changed from the default empty state
        const hasChanges =
            (addFieldModal.name && addFieldModal.name.trim() !== "") ||
            (addFieldModal.range && addFieldModal.range.trim() !== "") ||
            (addFieldModal.instruction && addFieldModal.instruction.trim() !== "") ||
            (addFieldModal.image && addFieldModal.image.trim() !== "") ||
            addFieldModal.required === true ||
            addFieldFile !== null;

        if (hasChanges) {
            setShowAddFieldDiscardWarning(true);
        } else {
            setAddFieldModal(null);
            setAddFieldFile(null);
            setAddFieldErrors({});
        }
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

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            const errorMessage = `Image size must be less than 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
            if (editModalField) {
                setEditModalFileError(errorMessage);
            } else if (uploadCollarIndex !== null) {
                setCollarFileErrors(prev => ({ ...prev, [uploadCollarIndex]: errorMessage }));
            }
            // Reset file input
            event.target.value = "";
            return;
        }

        if (editModalField) {
            setEditModalFile(file);
            setEditModalFileError(""); // Clear any previous error
        } else if (uploadCollarIndex !== null) {
            const newCollars = [...collarOptions];
            if (newCollars[uploadCollarIndex]) {
                newCollars[uploadCollarIndex].file = file;
                setCollarOptions(newCollars);
            }
            // Clear error for this collar
            setCollarFileErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[uploadCollarIndex];
                return newErrors;
            });
            setUploadCollarIndex(null);
        }
    };

    const handleCloseEditModal = (forceClose = false) => {
        if (forceClose) {
            setEditModalField(null);
            setEditModalFile(null);
            setEditModalFileError(""); // Clear file size error
            setOriginalEditModalField(null);
            setOriginalEditModalFile(null);
            setShowEditDiscardWarning(false);
            return;
        }

        // Use the stored original field for comparison, not the current field from measurementFields
        // This ensures that after saving and reopening, we compare against the saved state
        if (!originalEditModalField) {
            setEditModalField(null);
            setEditModalFile(null);
            setEditModalFileError(""); // Clear file size error
            setOriginalEditModalField(null);
            setOriginalEditModalFile(null);
            return;
        }

        // Helper function to normalize values for comparison
        const normalize = (val) => {
            if (val === null || val === undefined) return "";
            return String(val).trim();
        };

        // Check for changes by comparing with the original field state when modal was opened
        // Normalize values to handle empty strings, null, undefined consistently
        const hasChanges =
            normalize(originalEditModalField.name) !== normalize(editModalField.name) ||
            normalize(originalEditModalField.unit) !== normalize(editModalField.unit) ||
            normalize(originalEditModalField.range) !== normalize(editModalField.range) ||
            normalize(originalEditModalField.instruction) !== normalize(editModalField.instruction) ||
            Boolean(originalEditModalField.required) !== Boolean(editModalField.required) ||
            normalize(originalEditModalField.image) !== normalize(editModalField.image) ||
            editModalFile !== originalEditModalFile;

        if (hasChanges) {
            setShowEditDiscardWarning(true);
        } else {
            setEditModalField(null);
            setEditModalFile(null);
            setEditModalFileError(""); // Clear file size error
            setOriginalEditModalField(null);
            setOriginalEditModalFile(null);
        }
    };

    const handleSaveTemplate = async () => {
        setNameError(false);
        setDuplicateNameError(false);
        setFieldsError(false);
        setCollarErrors({});
        // Don't clear customFeaturesErrors - we'll merge new validation errors with existing ones (preserving file size errors)
        setVisibilityError(false);

        let hasValidationError = false;

        if (!templateName.trim()) {
            setNameError(true);
            hasValidationError = true;
        } else if (templates.some(t => t.name.toLowerCase() === templateName.trim().toLowerCase() && (!isEditMode || t.id !== editingTemplateId))) {
            setDuplicateNameError(true);
            hasValidationError = true;
        }

        // Validate visibility options for Custom preset
        const isCustomPreset = selectedPreset.id === "male-custom" || selectedPreset.id === "female-custom";
        if (isCustomPreset && !showMeasurementFields && !showAdvancedFeatures) {
            setVisibilityError(true);
            hasValidationError = true;
        }

        const enabledFields = measurementFields.filter((f) => f.enabled);
        if (enabledFields.length === 0) {
            setFieldsError(true);
            hasValidationError = true;
        }

        // Validate custom advanced features
        const enabledCustomFeatures = customAdvancedFeatures.filter(f => f.enabled);
        if (enabledCustomFeatures.length > 0) {
            const newCustomFeaturesErrors = { ...customFeaturesErrors }; // Preserve existing errors (like file size errors)
            enabledCustomFeatures.forEach(feature => {
                if (feature.options && feature.options.length > 0) {
                    feature.options.forEach(option => {
                        const existingErrors = newCustomFeaturesErrors[feature.id]?.[option.id] || {};
                        const optionErrors = { ...existingErrors }; // Preserve existing errors
                        
                        if (!option.name || !option.name.trim()) {
                            optionErrors.name = true;
                        }
                        
                        // Only set "required" error if:
                        // 1. There's no image and no file
                        // 2. There's no existing file size error (preserve file size errors)
                        const hasFileSizeError = typeof existingErrors.image === 'string' && existingErrors.image.includes('2MB');
                        if (!option.image && !option.file && !hasFileSizeError) {
                            optionErrors.image = "Image is required (upload or URL)";
                        }
                        
                        if (Object.keys(optionErrors).length > 0) {
                            if (!newCustomFeaturesErrors[feature.id]) {
                                newCustomFeaturesErrors[feature.id] = {};
                            }
                            newCustomFeaturesErrors[feature.id][option.id] = optionErrors;
                            hasValidationError = true;
                        }
                    });
                }
            });
            if (Object.keys(newCustomFeaturesErrors).length > 0) {
                setCustomFeaturesErrors(newCustomFeaturesErrors);
            }
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
                        // Remove file property and set image URL from upload response
                        const { file, ...rest } = field;
                        return { ...rest, image: data.url };
                    } else {
                        console.error("Upload failed: No URL returned", data);
                    }
                } catch (e) {
                    console.error("Field upload failed", e);
                }
            }
            // If no file, preserve existing image URL but remove file property
            const { file, ...rest } = field;
            // Only include image if it's not empty
            if (rest.image === "" || rest.image === null || rest.image === undefined) {
                delete rest.image;
            }
            return rest;
        }));

        const formData = new FormData();
        formData.append("intent", isEditMode ? "update" : "create");
        if (isEditMode && editingTemplateId) {
            formData.append("id", editingTemplateId);
        }
        formData.append("name", templateName);
        formData.append("gender", selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1));
        formData.append("clothingType", selectedPreset.id);
        // Prepare fields for saving - remove id and enabled, but keep all other properties including image
        const fieldsToSave = finalMeasurementFields.map(({ id, enabled, ...rest }) => rest);
        console.log("Saving fields with images:", fieldsToSave.map(f => ({ name: f.name, hasImage: !!f.image, image: f.image })));
        formData.append("fields", JSON.stringify(fieldsToSave));
        if (enableFitPreference) {
            formData.append("fitPreferences", JSON.stringify(fitPreferences));
        }
        if (enableCollarOption) {
            formData.append("collarOptions", JSON.stringify(finalCollarOptions));
        }
        formData.append("enableStitchingNotes", enableStitchingNotes.toString());
        
        // Process custom advanced features option images uploads
        let finalCustomFeatures = [...customAdvancedFeatures];
        if (customAdvancedFeatures.length > 0) {
            finalCustomFeatures = await Promise.all(customAdvancedFeatures.map(async (feature) => {
                if (feature.options && feature.options.length > 0) {
                    const processedOptions = await Promise.all(feature.options.map(async (option) => {
                        if (option.file) {
                            try {
                                const fd = new FormData();
                                fd.append("file", option.file);
                                const res = await fetch("/api/upload", { method: "POST", body: fd });
                                const data = await res.json();
                                if (data.url) {
                                    const { file, ...rest } = option;
                                    return { ...rest, image: data.url };
                                }
                            } catch (e) {
                                console.error("Custom feature option upload failed", e);
                            }
                        }
                        const { file, ...rest } = option;
                        return rest;
                    }));
                    return { ...feature, options: processedOptions };
                }
                return feature;
            }));
        }
        
        // Add custom advanced features
        if (finalCustomFeatures.length > 0) {
            formData.append("customAdvancedFeatures", JSON.stringify(finalCustomFeatures));
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
            {/* Hide scrollbar CSS */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
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
                        {fetcher.state !== "idle" ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Template")}
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

                {/* Custom Preset Visibility Options */}
                {(selectedPreset.id === "male-custom" || selectedPreset.id === "female-custom") && (
                    <div className="mb-6">
                        <div className={`bg-white border rounded-lg p-4 ${visibilityError ? 'border-red-300' : 'border-gray-200'}`}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Preview Options</h3>
                            <p className="text-xs text-gray-500 mb-4">Select what to show in the customer form preview</p>
                            
                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-11 h-6 rounded-full transition-colors ${showMeasurementFields ? "bg-blue-600" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showMeasurementFields ? "translate-x-5" : ""}`} />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={showMeasurementFields} 
                                        onChange={(e) => {
                                            setShowMeasurementFields(e.target.checked);
                                            setVisibilityError(false);
                                        }} 
                                        className="sr-only" 
                                    />
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Show Measurement Fields</span>
                                    </div>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative w-11 h-6 rounded-full transition-colors ${showAdvancedFeatures ? "bg-blue-600" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showAdvancedFeatures ? "translate-x-5" : ""}`} />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={showAdvancedFeatures} 
                                        onChange={(e) => {
                                            setShowAdvancedFeatures(e.target.checked);
                                            setVisibilityError(false);
                                        }} 
                                        className="sr-only" 
                                    />
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Show Advanced Features</span>
                                    </div>
                                </label>
                            </div>
                            
                            {visibilityError && (
                                <p className="mt-3 text-sm text-red-600">Please select at least one option to show in the customer preview.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-6 items-start">
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
                                <div className="mx-5 my-4 p-3 bg-red-50 border border-red-200 rounded-md">
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
                                                {field.instruction && (
                                                    <p className="text-sm text-gray-500 mb-1 line-clamp-2">{field.instruction}</p>
                                                )}
                                                {!field.instruction || (typeof field.instruction === 'string' && field.instruction.trim() === "") ? (
                                                    <div className="flex items-start gap-1.5 mb-1 text-amber-600">
                                                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <span className="text-xs">Please add measurement instructions.</span>
                                                    </div>
                                                ) : null}
                                                {field.range && (
                                                    <p className="text-xs text-gray-400">Range: {field.range} {field.unit}</p>
                                                )}
                                                {!field.range || (typeof field.range === 'string' && field.range.trim() === "") ? (
                                                    <div className="flex items-start gap-1.5 mt-1 text-amber-600">
                                                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <span className="text-xs">Please add a range for this measurement.</span>
                                                    </div>
                                                ) : null}
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
                                                    onClick={() => {
                                                        console.log("Opening info modal for field:", field);
                                                        console.log("Field image:", field.image);
                                                        console.log("Field file:", field.file);
                                                        setInfoModalField(field);
                                                    }}
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
                                                        // Store the original field state for comparison
                                                        setOriginalEditModalField({ ...field });
                                                        setEditModalField({ ...field });
                                                        // Store the original file state for comparison
                                                        const originalFile = field.file || null;
                                                        setOriginalEditModalFile(originalFile);
                                                        setEditModalFile(originalFile);
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
                                {/* Fit Preference */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${enableFitPreference ? "bg-blue-600" : "bg-gray-200"}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableFitPreference ? "translate-x-5" : ""}`} />
                                        </div>
                                        <input type="checkbox" checked={enableFitPreference} onChange={() => setEnableFitPreference(!enableFitPreference)} className="sr-only" />
                                        <span className="text-sm text-gray-700">Enable Fit Preference</span>
                                    </label>
                                    {enableFitPreference && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={fitPreferenceRequired}
                                                onChange={(e) => setFitPreferenceRequired(e.target.checked)}
                                                className="rounded text-red-500 focus:ring-red-500"
                                            />
                                            <span className="text-xs text-gray-600">Required</span>
                                        </label>
                                    )}
                                </div>

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

                                {/* Stitching Notes */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${enableStitchingNotes ? "bg-blue-600" : "bg-gray-200"}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableStitchingNotes ? "translate-x-5" : ""} `} />
                                        </div>
                                        <input type="checkbox" checked={enableStitchingNotes} onChange={() => setEnableStitchingNotes(!enableStitchingNotes)} className="sr-only" />
                                        <span className="text-sm text-gray-700">Enable Stitching Notes</span>
                                    </label>
                                    {enableStitchingNotes && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={stitchingNotesRequired}
                                                onChange={(e) => setStitchingNotesRequired(e.target.checked)}
                                                className="rounded text-red-500 focus:ring-red-500"
                                            />
                                            <span className="text-xs text-gray-600">Required</span>
                                        </label>
                                    )}
                                </div>

                                {/* Collar Option */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${enableCollarOption ? "bg-blue-600" : "bg-gray-200"}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableCollarOption ? "translate-x-5" : ""} `} />
                                        </div>
                                        <input type="checkbox" checked={enableCollarOption} onChange={() => setEnableCollarOption(!enableCollarOption)} className="sr-only" />
                                        <span className="text-sm text-gray-700">Enable Collar Option</span>
                                    </label>
                                    {enableCollarOption && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={collarOptionRequired}
                                                onChange={(e) => setCollarOptionRequired(e.target.checked)}
                                                className="rounded text-red-500 focus:ring-red-500"
                                            />
                                            <span className="text-xs text-gray-600">Required</span>
                                        </label>
                                    )}
                                </div>

                                {enableCollarOption && (
                                    <div className="pl-8 space-y-3">
                                        {collarOptions.filter(c => c.enabled).map((collar, index) => (
                                            <div key={collar.id} className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:border-gray-200 transition-colors group">
                                                {/* Image Upload Box */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-white hover:border-blue-500 transition-colors cursor-pointer ${
                                                        collarFileErrors[index] ? 'border-red-400' : 'border-gray-300'
                                                    }`}>
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
                                                                // Validate file size
                                                                if (file.size > MAX_FILE_SIZE) {
                                                                    const errorMessage = `Image size must be less than 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
                                                                    setCollarFileErrors(prev => ({ ...prev, [index]: errorMessage }));
                                                                    // Reset file input
                                                                    e.target.value = "";
                                                                    return;
                                                                }
                                                                // Clear any previous error
                                                                setCollarFileErrors(prev => {
                                                                    const newErrors = { ...prev };
                                                                    delete newErrors[index];
                                                                    return newErrors;
                                                                });
                                                                // Use handleFileUpload logic
                                                                setUploadCollarIndex(index);
                                                                const newCollars = [...collarOptions];
                                                                if (newCollars[index]) {
                                                                    newCollars[index].file = file;
                                                                    setCollarOptions(newCollars);
                                                                }
                                                                setUploadCollarIndex(null);
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
                                                    {collarFileErrors[index] && (
                                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {collarFileErrors[index]}
                                                        </p>
                                                    )}
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

                                {/* Custom Advanced Features */}
                                {customAdvancedFeatures.length > 0 && (
                                    <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs text-gray-500">Custom Features</p>
                                            {(() => {
                                                // Only show error if there are errors AND at least one enabled feature has errors
                                                const hasEnabledFeatureErrors = Object.keys(customFeaturesErrors).some(featureId => {
                                                    const feature = customAdvancedFeatures.find(f => {
                                                        // Handle both number and string IDs
                                                        const fId = typeof f.id === 'number' ? f.id : Number(f.id);
                                                        const errId = typeof featureId === 'number' ? featureId : Number(featureId);
                                                        return fId === errId;
                                                    });
                                                    return feature && feature.enabled && customFeaturesErrors[featureId] && Object.keys(customFeaturesErrors[featureId]).length > 0;
                                                });
                                                return hasEnabledFeatureErrors && (
                                                    <p className="text-xs text-red-500">Please fill all required fields</p>
                                                );
                                            })()}
                                        </div>
                                        {customAdvancedFeatures.map((feature, featureIndex) => (
                                            <div key={feature.id}>
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${feature.enabled ? "bg-blue-600" : "bg-gray-200"}`}>
                                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${feature.enabled ? "translate-x-5" : ""}`} />
                                                        </div>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={feature.enabled} 
                                                            onChange={() => {
                                                                const newEnabled = !feature.enabled;
                                                                
                                                                setCustomAdvancedFeatures(prev => prev.map(f => {
                                                                    if (f.id === feature.id) {
                                                                        // Add one default empty option when enabling and no options exist
                                                                        if (newEnabled && (!f.options || f.options.length === 0)) {
                                                                            return { ...f, enabled: newEnabled, options: [{ id: Date.now(), name: "", image: "" }] };
                                                                        }
                                                                        // Reset all option fields when disabling
                                                                        if (!newEnabled && f.options && f.options.length > 0) {
                                                                            return { 
                                                                                ...f, 
                                                                                enabled: newEnabled, 
                                                                                options: f.options.map(opt => {
                                                                                    const { file, ...rest } = opt; // Remove file property
                                                                                    return { ...rest, name: "", image: "" }; // Reset name and image
                                                                                })
                                                                            };
                                                                        }
                                                                        return { ...f, enabled: newEnabled };
                                                                    }
                                                                    return f;
                                                                }));
                                                                
                                                                // Clear errors for this feature when disabling
                                                                if (!newEnabled) {
                                                                    setCustomFeaturesErrors(prev => {
                                                                        const newErrors = { ...prev };
                                                                        if (newErrors[feature.id]) {
                                                                            delete newErrors[feature.id];
                                                                        }
                                                                        return newErrors;
                                                                    });
                                                                }
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <span className="text-sm text-gray-700">{feature.name}</span>
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        {feature.enabled && (
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={feature.required || false}
                                                                    onChange={(e) => {
                                                                        setCustomAdvancedFeatures(prev => prev.map(f => 
                                                                            f.id === feature.id ? { ...f, required: e.target.checked } : f
                                                                        ));
                                                                    }}
                                                                    className="rounded text-red-500 focus:ring-red-500"
                                                                />
                                                                <span className="text-xs text-gray-600">Required</span>
                                                            </label>
                                                        )}
                                                        <button
                                                            onClick={() => setDeleteCustomFeatureConfirm(feature)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                            title="Remove feature"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Options UI when feature is enabled */}
                                                {feature.enabled && (
                                                    <div className="pl-8 space-y-3">
                                                        {(feature.options || []).map((option, optionIndex) => (
                                                            <div key={option.id} className={`flex items-start gap-4 p-3 border rounded-lg bg-gray-50/50 hover:border-gray-200 transition-colors ${
                                                                customFeaturesErrors[feature.id]?.[option.id] ? 'border-red-300 bg-red-50/30' : 'border-gray-100'
                                                            }`}>
                                                                {/* Image Upload Box */}
                                                                <div className="relative flex-shrink-0">
                                                                    <div className={`w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-white hover:border-blue-500 transition-colors cursor-pointer ${
                                                                        customFeaturesErrors[feature.id]?.[option.id]?.image ? 'border-red-400' : 'border-gray-300'
                                                                    }`}>
                                                                        {(option.file || option.image) ? (
                                                                            <img src={option.file ? URL.createObjectURL(option.file) : option.image} alt={option.name} className="w-full h-full object-contain p-1" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                <svg className={`w-6 h-6 ${customFeaturesErrors[feature.id]?.[option.id]?.image ? 'text-red-300' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                </svg>
                                                                                <span className={`text-[10px] ${customFeaturesErrors[feature.id]?.[option.id]?.image ? 'text-red-400' : 'text-gray-400'}`}>Upload</span>
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
                                                                                // Validate file size
                                                                                if (file.size > MAX_FILE_SIZE) {
                                                                                    const errorMessage = `Image size must be less than 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
                                                                                    setCustomFeaturesErrors(prev => {
                                                                                        const newErrors = { ...prev };
                                                                                        if (!newErrors[feature.id]) {
                                                                                            newErrors[feature.id] = {};
                                                                                        }
                                                                                        if (!newErrors[feature.id][option.id]) {
                                                                                            newErrors[feature.id][option.id] = {};
                                                                                        }
                                                                                        newErrors[feature.id][option.id].image = errorMessage;
                                                                                        return newErrors;
                                                                                    });
                                                                                    // Reset file input
                                                                                    e.target.value = "";
                                                                                    return;
                                                                                }
                                                                                setCustomAdvancedFeatures(prev => prev.map(f => {
                                                                                    if (f.id === feature.id) {
                                                                                        const newOptions = [...(f.options || [])];
                                                                                        newOptions[optionIndex] = { ...newOptions[optionIndex], file };
                                                                                        return { ...f, options: newOptions };
                                                                                    }
                                                                                    return f;
                                                                                }));
                                                                                // Clear image error when file is uploaded
                                                                                if (customFeaturesErrors[feature.id]?.[option.id]?.image) {
                                                                                    setCustomFeaturesErrors(prev => {
                                                                                        const newErrors = { ...prev };
                                                                                        if (newErrors[feature.id]?.[option.id]) {
                                                                                            delete newErrors[feature.id][option.id].image;
                                                                                            if (Object.keys(newErrors[feature.id][option.id]).length === 0) {
                                                                                                delete newErrors[feature.id][option.id];
                                                                                            }
                                                                                            if (Object.keys(newErrors[feature.id]).length === 0) {
                                                                                                delete newErrors[feature.id];
                                                                                            }
                                                                                        }
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                
                                                                {/* Name and URL inputs */}
                                                                <div className="flex-1 space-y-2">
                                                                    <div>
                                                                        <input
                                                                            type="text"
                                                                            value={option.name}
                                                                            onChange={(e) => {
                                                                                setCustomAdvancedFeatures(prev => prev.map(f => {
                                                                                    if (f.id === feature.id) {
                                                                                        const newOptions = [...(f.options || [])];
                                                                                        newOptions[optionIndex] = { ...newOptions[optionIndex], name: e.target.value };
                                                                                        return { ...f, options: newOptions };
                                                                                    }
                                                                                    return f;
                                                                                }));
                                                                                // Clear name error when typing
                                                                                if (e.target.value.trim() && customFeaturesErrors[feature.id]?.[option.id]?.name) {
                                                                                    setCustomFeaturesErrors(prev => {
                                                                                        const newErrors = { ...prev };
                                                                                        if (newErrors[feature.id]?.[option.id]) {
                                                                                            delete newErrors[feature.id][option.id].name;
                                                                                            if (Object.keys(newErrors[feature.id][option.id]).length === 0) {
                                                                                                delete newErrors[feature.id][option.id];
                                                                                            }
                                                                                            if (Object.keys(newErrors[feature.id]).length === 0) {
                                                                                                delete newErrors[feature.id];
                                                                                            }
                                                                                        }
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            placeholder="Option name"
                                                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                                                customFeaturesErrors[feature.id]?.[option.id]?.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                                                            }`}
                                                                        />
                                                                        {customFeaturesErrors[feature.id]?.[option.id]?.name && (
                                                                            <p className="text-xs text-red-500 mt-1">Option name is required</p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            type="text"
                                                                            value={option.image || ""}
                                                                            onChange={(e) => {
                                                                                setCustomAdvancedFeatures(prev => prev.map(f => {
                                                                                    if (f.id === feature.id) {
                                                                                        const newOptions = [...(f.options || [])];
                                                                                        newOptions[optionIndex] = { ...newOptions[optionIndex], image: e.target.value };
                                                                                        return { ...f, options: newOptions };
                                                                                    }
                                                                                    return f;
                                                                                }));
                                                                                // Clear image error when URL is entered
                                                                                if (e.target.value.trim() && customFeaturesErrors[feature.id]?.[option.id]?.image) {
                                                                                    setCustomFeaturesErrors(prev => {
                                                                                        const newErrors = { ...prev };
                                                                                        if (newErrors[feature.id]?.[option.id]) {
                                                                                            delete newErrors[feature.id][option.id].image;
                                                                                            if (Object.keys(newErrors[feature.id][option.id]).length === 0) {
                                                                                                delete newErrors[feature.id][option.id];
                                                                                            }
                                                                                            if (Object.keys(newErrors[feature.id]).length === 0) {
                                                                                                delete newErrors[feature.id];
                                                                                            }
                                                                                        }
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            placeholder="Paste image URL or upload"
                                                                            className={`w-full px-3 py-1 text-xs bg-white border rounded focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 text-gray-500 ${
                                                                                customFeaturesErrors[feature.id]?.[option.id]?.image ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                                                            }`}
                                                                        />
                                                                        {customFeaturesErrors[feature.id]?.[option.id]?.image && (
                                                                            <p className="text-xs text-red-500 mt-1">
                                                                                {typeof customFeaturesErrors[feature.id][option.id].image === 'string' 
                                                                                    ? customFeaturesErrors[feature.id][option.id].image 
                                                                                    : "Image is required (upload or URL)"}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Delete Button */}
                                                                <button
                                                                    onClick={() => {
                                                                        setCustomAdvancedFeatures(prev => prev.map(f => {
                                                                            if (f.id === feature.id) {
                                                                                return { ...f, options: (f.options || []).filter((_, i) => i !== optionIndex) };
                                                                            }
                                                                            return f;
                                                                        }));
                                                                    }}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                                    title="Remove Option"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        
                                                        {/* Add Option Button */}
                                                        <button
                                                            onClick={() => {
                                                                setCustomAdvancedFeatures(prev => prev.map(f => {
                                                                    if (f.id === feature.id) {
                                                                        return { 
                                                                            ...f, 
                                                                            options: [...(f.options || []), { id: Date.now(), name: "", image: "" }] 
                                                                        };
                                                                    }
                                                                    return f;
                                                                }));
                                                            }}
                                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Add Option
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Custom Feature */}
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <p className="text-xs text-gray-500 mb-2">Add Custom Feature</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newCustomFeatureName}
                                            onChange={(e) => setNewCustomFeatureName(e.target.value)}
                                            placeholder="Enter feature name (e.g., Pocket Style)"
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && newCustomFeatureName.trim()) {
                                                    setCustomAdvancedFeatures(prev => [...prev, {
                                                        id: Date.now(),
                                                        name: newCustomFeatureName.trim(),
                                                        enabled: false,
                                                        options: []
                                                    }]);
                                                    setNewCustomFeatureName("");
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (newCustomFeatureName.trim()) {
                                                    setCustomAdvancedFeatures(prev => [...prev, {
                                                        id: Date.now(),
                                                        name: newCustomFeatureName.trim(),
                                                        enabled: false,
                                                        options: []
                                                    }]);
                                                    setNewCustomFeatureName("");
                                                }
                                            }}
                                            disabled={!newCustomFeatureName.trim()}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${newCustomFeatureName.trim() 
                                                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" 
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Customer Form Preview */}
                    <div className="w-80 self-start sticky top-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Customer Form Preview</h3>
                            <div className="border border-gray-100 rounded-lg p-6 bg-gray-50 flex flex-col items-start justify-center ">

                                <button
                                    onClick={() => {
                                        setPreviewCurrentStep(0);
                                        setPreviewMeasurementValues({});
                                        setPreviewSelectedFit(null);
                                        setPreviewSelectedCollar(null);
                                        setPreviewSelectedCustomOptions({});
                                        setPreviewStitchingNotes("");
                                        setShowPreviewModal(true);
                                    }}
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
                            {(() => {
                                // Check for image URL or file object
                                const imageUrl = infoModalField.image && infoModalField.image.trim() !== "" ? infoModalField.image : null;
                                const hasFile = infoModalField.file ? URL.createObjectURL(infoModalField.file) : null;
                                const displayImage = imageUrl || hasFile;
                                
                                console.log("Info modal - imageUrl:", imageUrl, "hasFile:", !!hasFile, "displayImage:", displayImage);
                                
                                return displayImage ? (
                                    <div className="w-[250px] h-[250px] bg-gray-50 rounded-lg mb-6 overflow-hidden border border-gray-100 flex items-center justify-center">
                                        <img 
                                            src={displayImage} 
                                            alt={infoModalField.name} 
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error("Image failed to load in tailor modal:", displayImage);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center mb-6">
                                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-400">No guide image available</span>
                                    </div>
                                );
                            })()}
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
                                    onChange={(e) => {
                                        // Only allow numbers, spaces, dashes, and commas
                                        const value = e.target.value.replace(/[^0-9\s\-,]/g, '');
                                        setEditModalField({ ...editModalField, range: value });
                                    }}
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
                                        {editModalFileError && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {editModalFileError}
                                            </p>
                                        )}
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
                                        // Clear any existing image URL when a new file is uploaded
                                        // The image URL will be set from the upload response when saving the template
                                        handleUpdateField(editModalField.id, "image", "");
                                    } else {
                                        // Save the image URL if it was pasted (not uploaded as file)
                                        if (editModalField.image !== undefined && editModalField.image !== null && editModalField.image.trim() !== "") {
                                            handleUpdateField(editModalField.id, "image", editModalField.image);
                                        }
                                    }

                                    handleUpdateField(editModalField.id, "required", editModalField.required);
                                    // Close modal and reset states after saving
                                    setEditModalField(null);
                                    setEditModalFile(null);
                                    setEditModalFileError(""); // Clear file size error
                                    setOriginalEditModalField(null);
                                    setOriginalEditModalFile(null);
                                }}
                                className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Field Modal */}
            {addFieldModal && (
                <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-lg font-bold text-gray-900">Add New Field</h2>
                            <button onClick={() => handleCloseAddFieldModal()} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Field Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Field Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addFieldModal.name}
                                    onChange={(e) => {
                                        setAddFieldModal({ ...addFieldModal, name: e.target.value });
                                        if (addFieldErrors.name) setAddFieldErrors(prev => ({ ...prev, name: "" }));
                                    }}
                                    placeholder="Enter field name"
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${addFieldErrors.name ? "border-red-500" : "border-gray-300"}`}
                                />
                                {addFieldErrors.name && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {addFieldErrors.name}
                                    </p>
                                )}
                            </div>
                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={addFieldModal.unit}
                                    onChange={(e) => {
                                        setAddFieldModal({ ...addFieldModal, unit: e.target.value });
                                        if (addFieldErrors.unit) setAddFieldErrors(prev => ({ ...prev, unit: "" }));
                                    }}
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${addFieldErrors.unit ? "border-red-500" : "border-gray-300"}`}
                                >
                                    <option value="">Select unit</option>
                                    <option value="in">Inches (in)</option>
                                    <option value="cm">Centimeters (cm)</option>
                                </select>
                                {addFieldErrors.unit && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {addFieldErrors.unit}
                                    </p>
                                )}
                            </div>
                            {/* Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Range <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addFieldModal.range}
                                    onChange={(e) => {
                                        // Only allow numbers, spaces, dashes, and commas
                                        const value = e.target.value.replace(/[^0-9\s\-,]/g, '');
                                        setAddFieldModal({ ...addFieldModal, range: value });
                                        if (addFieldErrors.range) setAddFieldErrors(prev => ({ ...prev, range: "" }));
                                    }}
                                    placeholder="e.g., 0 - 100"
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${addFieldErrors.range ? "border-red-500" : "border-gray-300"}`}
                                />
                                {addFieldErrors.range && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {addFieldErrors.range}
                                    </p>
                                )}
                            </div>
                            {/* Instruction */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Measurement Instructions <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={addFieldModal.instruction}
                                    onChange={(e) => {
                                        setAddFieldModal({ ...addFieldModal, instruction: e.target.value });
                                        if (addFieldErrors.instruction) setAddFieldErrors(prev => ({ ...prev, instruction: "" }));
                                    }}
                                    placeholder="Describe how to take this measurement..."
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${addFieldErrors.instruction ? "border-red-500" : "border-gray-300"}`}
                                />
                                {addFieldErrors.instruction && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {addFieldErrors.instruction}
                                    </p>
                                )}
                            </div>
                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guide Image <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4 items-start">
                                    {/* Image Preview Box */}
                                    <div className="relative flex-shrink-0 group">
                                        <div className={`w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-500 transition-colors relative ${addFieldErrors.image ? "border-red-500" : "border-gray-300"}`}>
                                            {(addFieldFile || addFieldModal.image) ? (
                                                <img src={addFieldFile ? URL.createObjectURL(addFieldFile) : addFieldModal.image} alt="Guide" className="w-full h-full object-cover" />
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
                                                onChange={handleAddFieldFileUpload}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer text-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute top-20 mt-1 w-full text-center">Change Image</p>
                                    </div>
                                    {/* URL Input */}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={addFieldModal.image || ""}
                                            onChange={(e) => {
                                                setAddFieldModal({ ...addFieldModal, image: e.target.value });
                                                if (addFieldErrors.image) setAddFieldErrors(prev => ({ ...prev, image: "" }));
                                            }}
                                            placeholder="Paste image URL or upload"
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 ${addFieldErrors.image ? "border-red-500" : "border-gray-200"}`}
                                        />
                                        <p className="text-xs text-gray-400">Click the image box to upload or paste a URL</p>
                                    </div>
                                </div>
                                {addFieldErrors.image && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {addFieldErrors.image}
                                    </p>
                                )}
                            </div>
                            {/* Required Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer mt-7">
                                <div className={`relative w-10 h-5 rounded-full transition-colors ${addFieldModal.required ? "bg-blue-600" : "bg-gray-200"}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${addFieldModal.required ? "translate-x-5" : ""}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={addFieldModal.required}
                                    onChange={() => setAddFieldModal({ ...addFieldModal, required: !addFieldModal.required })}
                                    className="sr-only"
                                />
                                <span className="text-sm text-gray-700">Required Field</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0">
                            <button
                                onClick={() => handleCloseAddFieldModal()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNewField}
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
                    {(() => {
                        // Check if Custom preset is selected
                        const isCustomPreset = selectedPreset.id === "male-custom" || selectedPreset.id === "female-custom";
                        
                        // Apply visibility settings for Custom preset
                        const shouldShowMeasurements = isCustomPreset ? showMeasurementFields : true;
                        const shouldShowAdvanced = isCustomPreset ? showAdvancedFeatures : true;
                        
                        const enabledFields = shouldShowMeasurements ? measurementFields.filter(f => f.enabled) : [];
                        const totalMeasurementSteps = enabledFields.length;
                        
                        // Calculate total steps: measurements + advanced options (if any) + review step
                        const hasAdvancedOptions = shouldShowAdvanced && (enableFitPreference || enableStitchingNotes || enableCollarOption || customAdvancedFeatures.filter(f => f.enabled && f.options?.length > 0).length > 0);
                        const advancedOptionsStep = hasAdvancedOptions ? 1 : 0;
                        const reviewStep = 1; // Always have a review step
                        const totalSteps = totalMeasurementSteps + advancedOptionsStep + reviewStep;
                        
                        const currentField = enabledFields[previewCurrentStep];
                        const isOnMeasurementStep = previewCurrentStep < totalMeasurementSteps;
                        const isOnAdvancedStep = previewCurrentStep === totalMeasurementSteps && hasAdvancedOptions;
                        const isOnReviewStep = previewCurrentStep === totalMeasurementSteps + advancedOptionsStep;
                        
                        return (
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] min-h-[90vh] flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-gray-900 font-semibold text-base">Custom Measurements</h2>
                                        <button 
                                            onClick={() => {
                                                setShowPreviewModal(false);
                                                setPreviewCurrentStep(0);
                                                setPreviewMeasurementValues({});
                                                setPreviewSelectedFit(null);
                                                setPreviewSelectedCollar(null);
                                                setPreviewSelectedCustomOptions({});
                                                setPreviewStitchingNotes("");
                                            }} 
                                            className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Step Progress - Clean dots with line */}
                                    {totalMeasurementSteps > 0 && (
                                        <div className="relative">
                                            {/* Progress line background */}
                                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 rounded-full" />
                                            {/* Progress line filled */}
                                            <div 
                                                className="absolute top-3 left-0 h-0.5 bg-green-500 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${(previewCurrentStep / (totalSteps - 1)) * 100}%` 
                                                }}
                                            />
                                            
                                            {/* Step dots */}
                                            <div className="relative flex justify-between">
                                                {enabledFields.map((field, index) => {
                                                    const hasValue = previewMeasurementValues[field.id] && previewMeasurementValues[field.id].trim() !== '';
                                                    const isCurrent = index === previewCurrentStep;
                                                    
                                                    return (
                                                        <button
                                                            key={field.id}
                                                            onClick={() => setPreviewCurrentStep(index)}
                                                            className="flex flex-col items-center cursor-pointer group"
                                                            title={field.name}
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                                isCurrent 
                                                                    ? hasValue 
                                                                        ? 'bg-green-500 text-white ring-4 ring-green-500/20'
                                                                        : 'bg-gray-900 text-white ring-4 ring-gray-900/20' 
                                                                    : hasValue
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-white border-2 border-gray-300 text-gray-400 group-hover:border-gray-400'
                                                            }`}>
                                                                {hasValue ? (
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold">{index + 1}</span>
                                                                )}
                                                            </div>
                                                            <span className={`mt-1.5 text-[10px] font-medium max-w-[50px] truncate ${
                                                                isCurrent ? 'text-gray-900' : hasValue ? 'text-green-600' : 'text-gray-500'
                                                            }`}>
                                                                {field.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                                
                                                {/* Options step */}
                                                {hasAdvancedOptions && (() => {
                                                    // Check if user has selected any options
                                                    const hasSelectedOptions = 
                                                        (enableFitPreference && previewSelectedFit !== null) ||
                                                        (enableStitchingNotes && previewStitchingNotes.trim() !== '') ||
                                                        (enableCollarOption && previewSelectedCollar !== null) ||
                                                        Object.keys(previewSelectedCustomOptions).length > 0;
                                                    
                                                    return (
                                                        <button
                                                            onClick={() => setPreviewCurrentStep(totalMeasurementSteps)}
                                                            className="flex flex-col items-center cursor-pointer group"
                                                            title="Options"
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                                isOnAdvancedStep 
                                                                    ? hasSelectedOptions
                                                                        ? 'bg-green-500 text-white ring-4 ring-green-500/20'
                                                                        : 'bg-gray-900 text-white ring-4 ring-gray-900/20' 
                                                                    : hasSelectedOptions
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-white border-2 border-gray-300 text-gray-400 group-hover:border-gray-400'
                                                            }`}>
                                                                {hasSelectedOptions ? (
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className={`mt-1.5 text-[10px] font-medium ${
                                                                isOnAdvancedStep ? 'text-gray-900' : hasSelectedOptions ? 'text-green-600' : 'text-gray-500'
                                                            }`}>
                                                                Options
                                                            </span>
                                                        </button>
                                                    );
                                                })()}
                                                
                                                {/* Review step */}
                                                <button
                                                    onClick={() => setPreviewCurrentStep(totalMeasurementSteps + advancedOptionsStep)}
                                                    className="flex flex-col items-center cursor-pointer group"
                                                    title="Review"
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                        isOnReviewStep 
                                                            ? 'bg-gray-900 text-white ring-4 ring-gray-900/20' 
                                                            : 'bg-white border-2 border-gray-300 text-gray-400 group-hover:border-gray-400'
                                                    }`}>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className={`mt-1.5 text-[10px] font-medium ${
                                                        isOnReviewStep ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                        Review
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-auto">
                                    {/* Measurement Step */}
                                    {isOnMeasurementStep && currentField && (
                                        <div className="p-6">
                                            {/* Title */}
                                            <div className="text-center mb-4 flex  items-center justify-between">
                                               
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {currentField.name}
                                                    {currentField.required && <span className="text-red-500 ml-1">*</span>}
                                                </h2>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Step {previewCurrentStep + 1} of {totalSteps}</p>
                                            </div>

                                            {/* Guide Image */}
                                            <div className="w-full h-52 mb-5 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                                                {(currentField.file || currentField.image) ? (
                                                    <img 
                                                        src={currentField.file ? URL.createObjectURL(currentField.file) : currentField.image} 
                                                        alt={`How to measure ${currentField.name}`}
                                                        className="max-w-full max-h-full object-contain p-4"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm">No guide image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Measurement Instructions Card */}
                                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-blue-900 mb-1">How to Measure</h3>
                                                        <p className="text-sm text-blue-800 leading-relaxed">
                                                            {currentField.instruction || "Follow the guide image to take this measurement."}
                                                        </p>
                                                        {currentField.range && (
                                                            <p className="text-xs text-blue-600 mt-2 font-medium">
                                                                Expected range: {currentField.range} {currentField.unit}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input Field */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-700">Enter your measurement ({currentField.unit})</label>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={previewMeasurementValues[currentField.id] || ""}
                                                            onChange={(e) => setPreviewMeasurementValues(prev => ({
                                                                ...prev,
                                                                [currentField.id]: e.target.value
                                                            }))}
                                                            placeholder="Enter value"
                                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 transition-all"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currentField.unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Advanced Options Step */}
                                    {isOnAdvancedStep && (
                                        <div className="p-6 space-y-5">
                                            <div className="text-center mb-2">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Final Step</p>
                                                <h2 className="text-xl font-bold text-gray-900">Additional Options</h2>
                                                <p className="text-sm text-gray-500 mt-1">Customize your order preferences</p>
                                            </div>

                                            {/* Fit Preference */}
                                            {enableFitPreference && (
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-sm font-semibold text-gray-900">
                                                            Fit Preference
                                                            {fitPreferenceRequired && <span className="text-red-500 ml-1">*</span>}
                                                        </h3>
                                                        {previewSelectedFit !== null && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewSelectedFit(null)}
                                                                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {fitPreferences.filter(f => f.enabled).map((fit) => (
                                                            <label key={fit.id} className="cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="fit_preference"
                                                                    className="peer sr-only"
                                                                    checked={previewSelectedFit === fit.id}
                                                                    onChange={() => setPreviewSelectedFit(fit.id)}
                                                                />
                                                                <div className="text-center py-2.5 px-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 transition-all hover:border-gray-300 peer-checked:hover:bg-gray-800 flex flex-col items-center justify-center min-h-[56px]">
                                                                    <span className="font-medium text-xs">{fit.label}</span>
                                                                    <span className="text-[10px] opacity-70">({fit.allowance})</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Stitching Notes */}
                                            {enableStitchingNotes && (
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                                        Stitching Notes
                                                        {stitchingNotesRequired && <span className="text-red-500 ml-1">*</span>}
                                                    </h3>
                                                    <textarea
                                                        value={previewStitchingNotes}
                                                        onChange={(e) => setPreviewStitchingNotes(e.target.value)}
                                                        placeholder="Add any specific instructions for the tailor..."
                                                        rows={2}
                                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 resize-none"
                                                    />
                                                </div>
                                            )}

                                            {/* Collar Option */}
                                            {enableCollarOption && (
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-sm font-semibold text-gray-900">
                                                            Collar Style
                                                            {collarOptionRequired && <span className="text-red-500 ml-1">*</span>}
                                                        </h3>
                                                        {previewSelectedCollar !== null && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewSelectedCollar(null)}
                                                                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {collarOptions.filter(c => c.enabled).map((collar) => (
                                                            <div
                                                                key={collar.id}
                                                                onClick={() => {
                                                                    if (previewSelectedCollar === collar.id) {
                                                                        setPreviewSelectedCollar(null);
                                                                    } else {
                                                                        setPreviewSelectedCollar(collar.id);
                                                                    }
                                                                }}
                                                                className={`cursor-pointer bg-white border-2 rounded-xl p-2 text-center transition-all ${previewSelectedCollar === collar.id
                                                                    ? 'border-gray-900 shadow-sm'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                <div className="w-full h-14 mb-1.5 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                                                    {collar.image ? (
                                                                        <img src={collar.image} alt={collar.name} className="h-full w-full object-contain p-1" />
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400">No Image</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-medium text-gray-700">{collar.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Custom Advanced Features */}
                                            {customAdvancedFeatures.filter(f => f.enabled && f.options?.length > 0).map((feature) => (
                                                <div key={feature.id} className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-sm font-semibold text-gray-900">
                                                            {feature.name}
                                                            {feature.required && <span className="text-red-500 ml-1">*</span>}
                                                        </h3>
                                                        {previewSelectedCustomOptions[feature.id] && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewSelectedCustomOptions(prev => {
                                                                    const newState = { ...prev };
                                                                    delete newState[feature.id];
                                                                    return newState;
                                                                })}
                                                                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {feature.options.map((option) => (
                                                            <div
                                                                key={option.id}
                                                                onClick={() => {
                                                                    if (previewSelectedCustomOptions[feature.id] === option.id) {
                                                                        setPreviewSelectedCustomOptions(prev => {
                                                                            const newState = { ...prev };
                                                                            delete newState[feature.id];
                                                                            return newState;
                                                                        });
                                                                    } else {
                                                                        setPreviewSelectedCustomOptions(prev => ({
                                                                            ...prev,
                                                                            [feature.id]: option.id
                                                                        }));
                                                                    }
                                                                }}
                                                                className={`cursor-pointer bg-white border-2 rounded-xl p-2 text-center transition-all ${
                                                                    previewSelectedCustomOptions[feature.id] === option.id
                                                                        ? 'border-gray-900 shadow-sm'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                <div className="w-full h-14 mb-1.5 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                                                    {(option.file || option.image) ? (
                                                                        <img 
                                                                            src={option.file ? URL.createObjectURL(option.file) : option.image} 
                                                                            alt={option.name} 
                                                                            className="h-full w-full object-contain p-1" 
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400">No Image</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-medium text-gray-700">{option.name || "Unnamed"}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Review Step */}
                                    {isOnReviewStep && (
                                        <div className="p-6">
                                            <div className="text-center mb-5">
                                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>
                                                <p className="text-sm text-gray-500 mt-1">Please verify all details before adding to cart</p>
                                            </div>

                                            {/* Measurements Table */}
                                            {enabledFields.length > 0 && (
                                                <div className="mb-5">
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        Measurements
                                                    </h3>
                                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Measurement</th>
                                                                    <th className="text-right py-2.5 px-4 font-semibold text-gray-700">Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {enabledFields.map((field, index) => (
                                                                    <tr key={field.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className="py-2.5 px-4 text-gray-700">
                                                                            {field.name}
                                                                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                                                        </td>
                                                                        <td className="py-2.5 px-4 text-right">
                                                                            {previewMeasurementValues[field.id] && previewMeasurementValues[field.id].trim() !== '' ? (
                                                                                <span className="font-medium text-gray-900">{previewMeasurementValues[field.id]} {field.unit}</span>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => setPreviewCurrentStep(index)}
                                                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                                                                >
                                                                                    + Add value
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Options Summary */}
                                            {hasAdvancedOptions && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                        </svg>
                                                        Additional Options
                                                    </h3>
                                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <tbody>
                                                                {enableFitPreference && (
                                                                    <tr className="bg-white border-b border-gray-100">
                                                                        <td className="py-2.5 px-4 text-gray-700">
                                                                            Fit Preference
                                                                            {fitPreferenceRequired && <span className="text-red-500 ml-0.5">*</span>}
                                                                        </td>
                                                                        <td className="py-2.5 px-4 text-right">
                                                                            {previewSelectedFit !== null ? (
                                                                                <span className="font-medium text-gray-900">
                                                                                    {fitPreferences.find(f => f.id === previewSelectedFit)?.label || '-'}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400 italic">Not selected</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {enableStitchingNotes && (
                                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                                        <td className="py-2.5 px-4 text-gray-700">
                                                                            Stitching Notes
                                                                            {stitchingNotesRequired && <span className="text-red-500 ml-0.5">*</span>}
                                                                        </td>
                                                                        <td className="py-2.5 px-4 text-right">
                                                                            {previewStitchingNotes ? (
                                                                                <span className="font-medium text-gray-900 max-w-[150px] truncate inline-block">{previewStitchingNotes}</span>
                                                                            ) : (
                                                                                <span className="text-gray-400 italic">None</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {enableCollarOption && (
                                                                    <tr className="bg-white border-b border-gray-100">
                                                                        <td className="py-2.5 px-4 text-gray-700">
                                                                            Collar Style
                                                                            {collarOptionRequired && <span className="text-red-500 ml-0.5">*</span>}
                                                                        </td>
                                                                        <td className="py-2.5 px-4 text-right">
                                                                            {previewSelectedCollar !== null ? (
                                                                                <span className="font-medium text-gray-900">
                                                                                    {collarOptions.find(c => c.id === previewSelectedCollar)?.name || '-'}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400 italic">Not selected</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {customAdvancedFeatures.filter(f => f.enabled && f.options?.length > 0).map((feature, index) => (
                                                                    <tr key={feature.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                                        <td className="py-2.5 px-4 text-gray-700">
                                                                            {feature.name}
                                                                            {feature.required && <span className="text-red-500 ml-0.5">*</span>}
                                                                        </td>
                                                                        <td className="py-2.5 px-4 text-right">
                                                                            {previewSelectedCustomOptions[feature.id] ? (
                                                                                <span className="font-medium text-gray-900">
                                                                                    {feature.options.find(o => o.id === previewSelectedCustomOptions[feature.id])?.name || '-'}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400 italic">Not selected</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Edit Options button */}
                                            {hasAdvancedOptions && (
                                                <div className="mt-5">
                                                    <button
                                                        onClick={() => setPreviewCurrentStep(totalMeasurementSteps)}
                                                        className="w-full px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        Edit Options
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* No fields enabled message */}
                                    {totalMeasurementSteps === 0 && !hasAdvancedOptions && (
                                        <div className="flex flex-col items-center justify-center py-16 px-6">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-center">No measurement fields enabled for this template.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer with navigation */}
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                    <div className="flex items-center gap-3">
                                        {/* Back button */}
                                        {previewCurrentStep > 0 && !isOnReviewStep && (
                                            <button
                                                onClick={() => setPreviewCurrentStep(prev => prev - 1)}
                                                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Back
                                            </button>
                                        )}
                                        
                                        {/* Next/Review/Add to Cart button */}
                                        <button
                                            onClick={() => {
                                                if (previewCurrentStep < totalSteps - 1) {
                                                    setPreviewCurrentStep(prev => prev + 1);
                                                } else {
                                                    // Last step (Review) - close modal
                                                    setShowPreviewModal(false);
                                                    setPreviewCurrentStep(0);
                                                    setPreviewMeasurementValues({});
                                                    setPreviewSelectedFit(null);
                                                    setPreviewSelectedCollar(null);
                                                    setPreviewSelectedCustomOptions({});
                                                    setPreviewStitchingNotes("");
                                                }
                                            }}
                                            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                                                isOnReviewStep 
                                                    ? 'text-white bg-green-600 hover:bg-green-700' 
                                                    : 'text-white bg-gray-900 hover:bg-gray-800'
                                            }`}
                                        >
                                            {isOnReviewStep ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    Confirm & Add to Cart
                                                </>
                                            ) : previewCurrentStep === totalMeasurementSteps + advancedOptionsStep - 1 ? (
                                                <>
                                                    Review Order
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    Save & Continue
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
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

            {/* Add Field Discard Warning Modal */}
            {showAddFieldDiscardWarning && (
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
                                    onClick={() => setShowAddFieldDiscardWarning(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Keep Editing
                                </button>
                                <button
                                    onClick={() => handleCloseAddFieldModal(true)}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 cursor-pointer"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Custom Feature Confirmation Modal */}
            {deleteCustomFeatureConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[700] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-5">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Custom Feature?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Are you sure you want to delete "<span className="font-medium text-gray-700">{deleteCustomFeatureConfirm.name}</span>"? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteCustomFeatureConfirm(null)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setCustomAdvancedFeatures(prev => prev.filter(f => f.id !== deleteCustomFeatureConfirm.id));
                                        setDeleteCustomFeatureConfirm(null);
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

        </div>
    )
}
