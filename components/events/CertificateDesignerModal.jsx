import React, { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useTheme } from "@/provider/ThemeProvider";
import { Themes } from "@/utils/misc/themes";
import CertificateDesigner from "./CertificateDesigner";
import ImportJsonModal from "./ImportJsonModal";
import { Award, X, Save, RefreshCw, List } from "lucide-react";

const CertificateDesignerModal = ({
    event,
    onClose,
    onSaved = () => {},
    initialTemplateKey = "participants",
}) => {
    const [certificate, setCertificate] = useState(() => {
        const cert = { ...(event?.certificate || {}) };
        delete cert._id;
        return cert;
    });

    const [jimpConfig, setJimpConfig] = useState(() => ({
        yOffset: event?.jimp_config?.yOffset ?? "-70",
        xOffset: event?.jimp_config?.xOffset ?? "0",
        color: event?.jimp_config?.color || "white",
        font_size: event?.jimp_config?.font_size ?? "64",
        ...(event?.jimp_config || {}),
    }));

    const [saving, setSaving] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const toast = useToast();
    const { isDark } = useTheme();

    const showToast = (status, title, description) => {
        const palette = isDark ? Themes.dark : Themes.light;
        toast({
            title,
            description,
            status,
            duration: 4000,
            isClosable: true,
            position: "top-right",
            containerStyle: {
                background: palette[status]?.background || palette.info.background,
                color: palette[status]?.color || palette.info.color,
            },
        });
    };

    const handleChangeCertificate = (field, value) => {
        setCertificate((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeJimpConfig = (field, value) => {
        setJimpConfig((prev) => ({ ...prev, [field]: value }));
    };

    const handleBatchChangeJimpConfig = (updates) => {
        setJimpConfig((prev) => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!event?.slug) return;
        setSaving(true);
        try {
            const response = await axios.patch(`/api/v1/events/${event.slug}`, {
                certificate,
                jimp_config: jimpConfig,
            });

            showToast(
                "success",
                "Saved Successfully",
                "Certificate templates and text configurations updated."
            );
            onSaved(response.data.data || { ...event, certificate, jimp_config: jimpConfig });
            onClose();
        } catch (error) {
            console.error("Error saving certificate configuration:", error);
            showToast(
                "error",
                "Save Failed",
                error.response?.data?.error || error.message || "Failed to update event"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 animate-fadeIn">
            <div className="bg-light-background-light dark:bg-dark-background-light shadow-2xl rounded-2xl w-[98%] max-w-6xl max-h-[94vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-light-background-dark/30 dark:bg-dark-background-dark/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-dark-accent/20 text-dark-accent">
                            <Award className="w-6 h-6 text-dark-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-light-color dark:text-dark-accent">
                                Certificate Configuration
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {event?.event_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowImport(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <List className="w-3.5 h-3.5" />
                            <span>Lists</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <CertificateDesigner
                        certificate={certificate}
                        jimp_config={jimpConfig}
                        onChangeCertificate={handleChangeCertificate}
                        onChangeJimpConfig={handleChangeJimpConfig}
                        onBatchChangeJimpConfig={handleBatchChangeJimpConfig}
                        eventName={event?.event_name}
                        initialSelectedTemplate={initialTemplateKey}
                        isModal={true}
                    />
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-light-background-dark/30 dark:bg-dark-background-dark/30">
                    <div className="text-xs text-gray-500 font-mono">
                        Y Offset: <span className="text-dark-accent font-bold">{jimpConfig.yOffset}px</span> | X Offset:{" "}
                        <span className="text-dark-accent font-bold">{jimpConfig.xOffset}px</span> | Size:{" "}
                        <span className="text-dark-accent font-bold">{jimpConfig.font_size}px</span> | Color:{" "}
                        <span className="text-dark-accent font-bold">{jimpConfig.color}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-dark-accent text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Certificate Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showImport && (
                <ImportJsonModal
                    slug={event?.slug}
                    onClose={() => setShowImport(false)}
                />
            )}
        </div>
    );
};

export default CertificateDesignerModal;
