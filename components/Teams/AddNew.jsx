import React, { useState, useMemo } from "react";
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Checkbox,
    Stack,
    Box,
    Text,
    useDisclosure,
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

const initialFormState = {
    index: "",
    usn: "",
    name: "",
    domain: "",
    caption: "",
    pictureUrl: "",
    isCurrent: true,
    status: [{ position: "", joined: "" }],
    socials: {
        github: "",
        website: "",
        linkedin: "",
        twitter: "",
        srmMailID: ""
    }
};

const AddNew = ({ onSuccess, existingYears = [] }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [picImgError, setPicImgError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else if (name === "pictureUrl") {
            setPicImgError(false);
            setFormData({ ...formData, pictureUrl: value });
        } else if (name.includes("socials")) {
            const socialKey = name.split(".")[1];
            setFormData({
                ...formData,
                socials: {
                    ...formData.socials,
                    [socialKey]: value
                }
            });
        } else if (name.startsWith("status.")) {
            const [, idxStr, key] = name.split(".");
            const idx = Number(idxStr);
            const next = [...formData.status];
            next[idx] = {
                ...next[idx],
                [key]: key === "joined" ? value.replace(/[^0-9]/g, "").slice(0, 4) : value
            };
            setFormData({ ...formData, status: next });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const addStatusRow = () => {
        setFormData((prev) => ({
            ...prev,
            status: [...prev.status, { position: "", joined: "" }]
        }));
    };

    const removeStatusRow = (i) => {
        setFormData((prev) => ({
            ...prev,
            status: prev.status.filter((_, idx) => idx !== i)
        }));
    };

    const isDuplicateYear = (year, rowIndex) => {
        if (!year) return false;
        const yStr = String(year).trim();
        if (!yStr) return false;
        return (formData.status || []).some(
            (s, idx) => idx !== rowIndex && String(s.joined).trim() === yStr
        );
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const trimmedUsn = (formData.usn || "").trim();
        if (!trimmedUsn) {
            toast({
                title: "Missing RA Number",
                description: "Please enter the member's RA Number / USN.",
                status: "warning",
                duration: 5000,
                isClosable: true
            });
            return;
        }

        const trimmedName = (formData.name || "").trim();
        if (!trimmedName) {
            toast({
                title: "Missing Name",
                description: "Please enter the member's name.",
                status: "warning",
                duration: 5000,
                isClosable: true
            });
            return;
        }

        const enteredYears = (formData.status || [])
            .map((s) => String(s.joined).trim())
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

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                usn: trimmedUsn,
                name: trimmedName,
                index:
                    formData.index === "" ||
                    formData.index === null ||
                    formData.index === undefined
                        ? undefined
                        : Number(formData.index),
                // coerce joined to numbers
                status: (formData.status || [])
                    .filter((s) => s.position && s.joined !== "")
                    .map((s) => ({
                        position: s.position,
                        joined: Number(s.joined)
                    }))
            };
            if (payload.index === undefined) {
                delete payload.index;
            }
            await axios.post("/api/v1/teams", payload);
            toast({
                title: "Member added.",
                description: "The new member has been added successfully.",
                status: "success",
                duration: 5000,
                isClosable: true
            });
            setFormData(initialFormState);
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error adding member:", error);
            const errorMsg =
                error.response?.data?.error ||
                error.message ||
                "There was an error adding the member.";
            toast({
                title: error.response?.status === 409 ? "Member Already Exists" : "Error",
                description: errorMsg,
                status: "error",
                duration: 6000,
                isClosable: true
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button colorScheme="teal" onClick={onOpen}>
                Add New
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Member</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <FormControl>
                                <FormLabel htmlFor="index">Index (Optional)</FormLabel>
                                <Input
                                    id="index"
                                    name="index"
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={formData.index}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="usn">RA Number / USN</FormLabel>
                                <Input
                                    id="usn"
                                    name="usn"
                                    placeholder="Add reg / RA number here (e.g. RA2211003010001)"
                                    value={formData.usn}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="name">Name</FormLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="domain">Domain</FormLabel>
                                <Select
                                    id="domain"
                                    name="domain"
                                    placeholder="Select domain"
                                    value={formData.domain}
                                    onChange={handleChange}
                                >
                                    <option value="Development">
                                        Development
                                    </option>
                                    <option value="Cyber Security">
                                        Cyber Security
                                    </option>
                                    <option value="Creatives">Creatives</option>
                                    <option value="Corporate">Corporate</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="caption">Caption</FormLabel>
                                <Input
                                    id="caption"
                                    name="caption"
                                    placeholder="Enter caption or quote"
                                    value={formData.caption}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <Stack spacing={3}>
                                <FormLabel>Status history</FormLabel>
                                {formData.status.map((row, i) => (
                                    <Stack
                                        direction={{
                                            base: "column",
                                            md: "row"
                                        }}
                                        spacing={3}
                                        key={i}
                                    >
                                        <FormControl isRequired>
                                            <FormLabel>Position</FormLabel>
                                            <Select
                                                name={`status.${i}.position`}
                                                placeholder="Select position"
                                                value={row.position}
                                                onChange={handleChange}
                                            >
                                                <option value="Mainframe">
                                                    Mainframe
                                                </option>
                                                <option value="Kernel">
                                                    Kernel
                                                </option>
                                                <option value="Root">
                                                    Root
                                                </option>
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
                                                value={row.joined}
                                                onChange={handleChange}
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
                                                formData.status.length <= 1
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </Stack>
                                ))}
                                <Button onClick={addStatusRow}>
                                    Add status
                                </Button>
                            </Stack>

                            <FormControl isRequired>
                                <FormLabel htmlFor="pictureUrl">
                                    Picture URL
                                </FormLabel>
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
                                        id="pictureUrl"
                                        name="pictureUrl"
                                        placeholder="Image URL (e.g. https://ik.imagekit.io/...)"
                                        value={formData.pictureUrl}
                                        onChange={handleChange}
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

                            <FormControl>
                                <FormLabel>Socials</FormLabel>
                                <Stack spacing={3}>
                                    {/* GitHub */}
                                    <Box>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" color={formData.socials.github?.trim() ? "teal.500" : "gray.400"}>
                                                {getSocialIcon(
                                                    formData.socials.github?.trim()
                                                        ? detectSocialPlatform(formData.socials.github)
                                                        : "github"
                                                )}
                                            </InputLeftElement>
                                            <Input
                                                name="socials.github"
                                                placeholder="GitHub profile URL (e.g. https://github.com/...)"
                                                value={formData.socials.github}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                        {getSocialHint(formData.socials.github) && (
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {getSocialHint(formData.socials.github)}
                                            </Text>
                                        )}
                                    </Box>

                                    {/* Website / Instagram */}
                                    <Box>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" width="3rem">
                                                {renderWebsiteOrInstaIcon(formData.socials.website)}
                                            </InputLeftElement>
                                            <Input
                                                name="socials.website"
                                                pl="3rem"
                                                placeholder="Website or Instagram URL (e.g. https://...)"
                                                value={formData.socials.website}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                        {getSocialHint(formData.socials.website) ? (
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {getSocialHint(formData.socials.website)}
                                            </Text>
                                        ) : (
                                            <Text fontSize="xs" color="gray.400" mt={1}>
                                                Website or Instagram URL
                                            </Text>
                                        )}
                                    </Box>

                                    {/* LinkedIn */}
                                    <Box>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" color={formData.socials.linkedin?.trim() ? "teal.500" : "gray.400"}>
                                                {getSocialIcon(
                                                    formData.socials.linkedin?.trim()
                                                        ? detectSocialPlatform(formData.socials.linkedin)
                                                        : "linkedin"
                                                )}
                                            </InputLeftElement>
                                            <Input
                                                name="socials.linkedin"
                                                placeholder="LinkedIn profile URL (e.g. https://linkedin.com/in/...)"
                                                value={formData.socials.linkedin}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                        {getSocialHint(formData.socials.linkedin) && (
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {getSocialHint(formData.socials.linkedin)}
                                            </Text>
                                        )}
                                    </Box>

                                    {/* Twitter */}
                                    <Box>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" color={formData.socials.twitter?.trim() ? "teal.500" : "gray.400"}>
                                                {getSocialIcon(
                                                    formData.socials.twitter?.trim()
                                                        ? detectSocialPlatform(formData.socials.twitter)
                                                        : "twitter"
                                                )}
                                            </InputLeftElement>
                                            <Input
                                                name="socials.twitter"
                                                placeholder="Twitter/X profile URL (e.g. https://x.com/...)"
                                                value={formData.socials.twitter}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                        {getSocialHint(formData.socials.twitter) && (
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {getSocialHint(formData.socials.twitter)}
                                            </Text>
                                        )}
                                    </Box>

                                    {/* SRM Mail ID */}
                                    <Box>
                                        <Input
                                            name="socials.srmMailID"
                                            placeholder="SRM Mail ID (e.g. netid@srmist.edu.in)"
                                            value={formData.socials.srmMailID}
                                            onChange={handleChange}
                                        />
                                    </Box>
                                </Stack>
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                                <Checkbox
                                    id="isCurrent"
                                    name="isCurrent"
                                    isChecked={formData.isCurrent}
                                    onChange={handleChange}
                                >
                                    Is Current?
                                </Checkbox>
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" onClick={onClose} isDisabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleSubmit}
                            isLoading={submitting}
                            loadingText="Saving..."
                            isDisabled={submitting}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddNew;

