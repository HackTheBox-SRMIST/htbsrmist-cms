import React, { useState, useEffect, useMemo } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    Box,
    Text,
    RadioGroup,
    Radio,
    Select,
    useToast
} from "@chakra-ui/react";
import axios from "axios";
import { FaGithub, FaInstagram, FaLink, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
    isValidSocialUrl,
    formatExternalUrl,
    detectSocialPlatform,
    isImageUrl,
    getTransformedImageUrl
} from "@/utils/misc/socialUrls";

const renderWebsiteOrInstaIcon = (val) => {
    const trimmed = val?.trim();
    if (!trimmed) {
        return (
            <div className="flex items-center justify-center gap-1 text-gray-400 dark:text-gray-400">
                <FaLink className="text-[12px]" />
                <span className="text-[10px] opacity-70">/</span>
                <FaInstagram className="text-[13px]" />
            </div>
        );
    }
    const platform = detectSocialPlatform(trimmed);
    if (platform === "instagram") {
        return <FaInstagram className="text-[16px] text-teal-500" />;
    }
    return <FaLink className="text-[15px] text-teal-500" />;
};

const getSocialIcon = (platform) => {
    switch (platform) {
        case "instagram":
            return <FaInstagram />;
        case "linkedin":
            return <FaLinkedin />;
        case "twitter":
            return <FaXTwitter />;
        case "github":
            return <FaGithub />;
        default:
            return <FaLink />;
    }
};

const getSocialHint = (val) => {
    if (!val || typeof val !== "string" || !val.trim()) return null;
    const trimmed = val.trim();
    if (!isValidSocialUrl(trimmed)) {
        return "Invalid or placeholder URL";
    }
    const platform = detectSocialPlatform(trimmed);
    const platformNames = {
        instagram: "an Instagram",
        linkedin: "a LinkedIn",
        twitter: "a Twitter/X",
        github: "a GitHub",
        website: "a website"
    };
    const platformLabel = platformNames[platform] || "a website";
    const formatted = formatExternalUrl(trimmed);
    if (!/^https?:\/\//i.test(trimmed)) {
        return `Looks like ${platformLabel} URL (opens as: ${formatted})`;
    }
    return `Looks like ${platformLabel} URL`;
};

const EditModal = ({ isOpen, onClose, team, onEdit, existingYears = [] }) => {
    const [formData, setFormData] = useState({ ...team });
    const [picImgError, setPicImgError] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            // Initialize status array from legacy fields if missing
            const initial = { ...team };
            if (!Array.isArray(initial.status) || initial.status.length === 0) {
                if (initial.position && initial.joined) {
                    initial.status = [
                        { position: initial.position, joined: initial.joined }
                    ];
                } else {
                    initial.status = [{ position: "", joined: "" }];
                }
            }
            if (!initial.socials) {
                initial.socials = {
                    github: "",
                    website: "",
                    linkedin: "",
                    twitter: "",
                    srmMailID: ""
                };
            }
            setFormData(initial);
            setPicImgError(false);
        }
    }, [isOpen, team]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "pictureUrl") {
            setPicImgError(false);
            setFormData((prevData) => ({
                ...prevData,
                pictureUrl: value
            }));
        } else if (name.startsWith("socials.")) {
            const key = name.split(".")[1];
            setFormData((prevData) => ({
                ...prevData,
                socials: {
                    ...(prevData.socials || {}),
                    [key]: value
                }
            }));
        } else if (name.startsWith("status.")) {
            const [, idxStr, key] = name.split(".");
            const idx = Number(idxStr);
            setFormData((prevData) => {
                const next = [...(prevData.status || [])];
                next[idx] = {
                    ...next[idx],
                    [key]:
                        key === "joined"
                            ? e.target.value.replace(/[^0-9]/g, "").slice(0, 4)
                            : value
                };
                return { ...prevData, status: next };
            });
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const addStatusRow = () => {
        setFormData((prev) => ({
            ...prev,
            status: [...(prev.status || []), { position: "", joined: "" }]
        }));
    };

    const removeStatusRow = (i) => {
        setFormData((prev) => ({
            ...prev,
            status: (prev.status || []).filter((_, idx) => idx !== i)
        }));
    };

    const isDuplicateYear = (year, rowIndex) => {
        if (!year) return false;
        const yStr = String(year).trim();
        if (!yStr) return false;
        return (formData.status || []).some(
            (s, idx) => idx !== rowIndex && String(s?.joined).trim() === yStr
        );
    };

    const handleSubmit = async () => {
        const enteredYears = (formData.status || [])
            .map((s) => String(s?.joined).trim())
            .filter(Boolean);

        const duplicates = enteredYears.filter(
            (yr, idx) => enteredYears.indexOf(yr) !== idx
        );

        if (duplicates.length > 0) {
            toast({
                title: "Duplicate Year Entry",
                description: `Year ${duplicates[0]} already exists in status history. You cannot add multiple positions for the same year—please modify the existing entry instead.`,
                status: "warning",
                duration: 5000,
                isClosable: true
            });
            return;
        }

        try {
            const payload = {
                ...formData,
                index:
                    formData.index === "" ||
                    formData.index === null ||
                    formData.index === undefined
                        ? null
                        : Number(formData.index),
                status: (formData.status || [])
                    .filter((s) => s.position && s.joined !== "")
                    .map((s) => ({
                        position: s.position,
                        joined: Number(s.joined)
                    }))
            };
            delete payload._id;
            delete payload.__v;
            delete payload.createdAt;
            delete payload.updatedAt;

            await axios.patch(`/api/v1/teams/${team.usn}`, payload);
            toast({
                title: "Updated",
                description: `${formData.name || team.name}'s details have been updated successfully.`,
                status: "success",
                duration: 5000,
                isClosable: true
            });
            onEdit(payload);
            onClose();
        } catch (error) {
            console.error("Error updating team member:", error);
            const errorMsg =
                error.response?.data?.error ||
                error.message ||
                "Unable to update team member.";
            toast({
                title: "Error",
                description: errorMsg,
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
    };

    const socials = formData.socials || {};

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Team Member</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={4}>
                        <FormControl>
                            <FormLabel>Index (Optional)</FormLabel>
                            <Input
                                name="index"
                                type="number"
                                placeholder="e.g. 1"
                                value={formData.index || ""}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input
                                name="name"
                                placeholder="Full Name"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Domain</FormLabel>
                            <Select
                                name="domain"
                                value={formData.domain || ""}
                                onChange={(e) =>
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        domain: e.target.value
                                    }))
                                }
                            >
                                <option value="Cyber Security">
                                    Cybersecurity
                                </option>
                                <option value="Development">Development</option>
                                <option value="Creatives">Creatives</option>
                                <option value="Corporate">Corporate</option>
                            </Select>
                        </FormControl>

                        <Stack spacing={3}>
                            <FormLabel>Status history</FormLabel>
                            {(formData.status || []).map((row, i) => (
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    spacing={3}
                                    key={i}
                                >
                                    <FormControl isRequired>
                                        <FormLabel>Position</FormLabel>
                                        <Select
                                            name={`status.${i}.position`}
                                            placeholder="Select position"
                                            value={row.position || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Mainframe">
                                                Mainframe
                                            </option>
                                            <option value="Kernel">
                                                Kernel
                                            </option>
                                            <option value="Root">Root</option>
                                            <option value="Sudoer">
                                                Sudoer
                                            </option>
                                            <option value="Sticky Bit">
                                                Sticky Bit
                                            </option>
                                            <option value="Binary">
                                                Binary
                                            </option>
                                        </Select>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={isDuplicateYear(row.joined, i)}>
                                        <FormLabel>Year</FormLabel>
                                        <Input
                                            type="number"
                                            name={`status.${i}.joined`}
                                            placeholder="e.g. 2026"
                                            value={row.joined || ""}
                                            onChange={handleInputChange}
                                            onInput={(e) => {
                                                if (e.target.value.length > 4) {
                                                    e.target.value = e.target.value.slice(0, 4);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            max={9999}
                                        />
                                        {isDuplicateYear(row.joined, i) && (
                                            <FormErrorMessage>
                                                Year {row.joined} already exists. Please modify that entry instead.
                                            </FormErrorMessage>
                                        )}
                                    </FormControl>
                                    <Button
                                        onClick={() => removeStatusRow(i)}
                                        disabled={
                                            (formData.status || []).length <= 1
                                        }
                                    >
                                        Remove
                                    </Button>
                                </Stack>
                            ))}
                            <Button onClick={addStatusRow}>Add status</Button>
                        </Stack>

                        <FormControl>
                            <FormLabel>Caption</FormLabel>
                            <Input
                                name="caption"
                                placeholder="Enter caption or quote"
                                value={formData.caption || ""}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Picture URL</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    pointerEvents="none"
                                    color={
                                        formData.pictureUrl &&
                                        isImageUrl(formData.pictureUrl)
                                            ? "teal.500"
                                            : "gray.400"
                                    }
                                >
                                    <FaLink />
                                </InputLeftElement>
                                <Input
                                    name="pictureUrl"
                                    placeholder="Image URL (e.g. https://ik.imagekit.io/...)"
                                    value={formData.pictureUrl || ""}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            {formData.pictureUrl && formData.pictureUrl.trim() && (
                                <Box mt={2} display="flex" alignItems="center" gap={3}>
                                    {isImageUrl(formData.pictureUrl) ? (
                                        <>
                                            <Box
                                                w="48px"
                                                h="48px"
                                                borderRadius="md"
                                                overflow="hidden"
                                                border="1px solid"
                                                borderColor="gray.300"
                                                bg="blackAlpha.100"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                flexShrink={0}
                                            >
                                                {!picImgError ? (
                                                    <img
                                                        src={getTransformedImageUrl(formData.pictureUrl)}
                                                        alt="Preview"
                                                        onError={() => setPicImgError(true)}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                ) : (
                                                    <Text fontSize="10px" color="red.500" textAlign="center">
                                                        Broken Image
                                                    </Text>
                                                )}
                                            </Box>
                                            <Text fontSize="xs" color={picImgError ? "red.400" : "gray.500"}>
                                                {picImgError ? "Image failed to load (letter initial fallback will be used)" : "Live thumbnail preview"}
                                            </Text>
                                        </>
                                    ) : (
                                        <Box display="flex" alignItems="center" gap={1.5} color="gray.500">
                                            <FaLink />
                                            <Text fontSize="xs">Looks like a website URL</Text>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </FormControl>

                        {/* GitHub */}
                        <FormControl>
                            <FormLabel>GitHub</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" color={socials.github?.trim() ? "teal.500" : "gray.400"}>
                                    {getSocialIcon(
                                        socials.github?.trim()
                                            ? detectSocialPlatform(socials.github)
                                            : "github"
                                    )}
                                </InputLeftElement>
                                <Input
                                    name="socials.github"
                                    placeholder="GitHub profile URL (e.g. https://github.com/...)"
                                    value={socials.github || ""}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            {getSocialHint(socials.github) && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {getSocialHint(socials.github)}
                                </Text>
                            )}
                        </FormControl>

                        {/* Website / Instagram */}
                        <FormControl>
                            <FormLabel>Website / Instagram</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" width="3rem">
                                    {renderWebsiteOrInstaIcon(socials.website)}
                                </InputLeftElement>
                                <Input
                                    name="socials.website"
                                    pl="3rem"
                                    placeholder="Website or Instagram URL (e.g. https://...)"
                                    value={socials.website || ""}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            {getSocialHint(socials.website) ? (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {getSocialHint(socials.website)}
                                </Text>
                            ) : (
                                <Text fontSize="xs" color="gray.400" mt={1}>
                                    Website or Instagram URL
                                </Text>
                            )}
                        </FormControl>

                        {/* LinkedIn */}
                        <FormControl>
                            <FormLabel>LinkedIn</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" color={socials.linkedin?.trim() ? "teal.500" : "gray.400"}>
                                    {getSocialIcon(
                                        socials.linkedin?.trim()
                                            ? detectSocialPlatform(socials.linkedin)
                                            : "linkedin"
                                    )}
                                </InputLeftElement>
                                <Input
                                    name="socials.linkedin"
                                    placeholder="LinkedIn profile URL (e.g. https://linkedin.com/in/...)"
                                    value={socials.linkedin || ""}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            {getSocialHint(socials.linkedin) && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {getSocialHint(socials.linkedin)}
                                </Text>
                            )}
                        </FormControl>

                        {/* Twitter */}
                        <FormControl>
                            <FormLabel>Twitter</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" color={socials.twitter?.trim() ? "teal.500" : "gray.400"}>
                                    {getSocialIcon(
                                        socials.twitter?.trim()
                                            ? detectSocialPlatform(socials.twitter)
                                            : "twitter"
                                    )}
                                </InputLeftElement>
                                <Input
                                    name="socials.twitter"
                                    placeholder="Twitter/X profile URL (e.g. https://x.com/...)"
                                    value={socials.twitter || ""}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            {getSocialHint(socials.twitter) && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {getSocialHint(socials.twitter)}
                                </Text>
                            )}
                        </FormControl>

                        {/* SRM Mail ID */}
                        <FormControl>
                            <FormLabel>SRM Mail ID</FormLabel>
                            <Input
                                name="socials.srmMailID"
                                placeholder="SRM Mail ID (e.g. netid@srmist.edu.in)"
                                value={socials.srmMailID || ""}
                                onChange={handleInputChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Current Member</FormLabel>
                            <RadioGroup
                                name="isCurrent"
                                value={String(formData.isCurrent)}
                                onChange={(value) =>
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        isCurrent: value === "true"
                                    }))
                                }
                            >
                                <Stack direction="row">
                                    <Radio value="true">True</Radio>
                                    <Radio value="false">False</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditModal;

