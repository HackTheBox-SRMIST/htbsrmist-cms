import React, { useState, useEffect } from "react";

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
    Input,
    Stack,
    RadioGroup,
    Radio,
    Select,
    useToast
} from "@chakra-ui/react";
import axios from "axios";

const EditModal = ({ isOpen, onClose, team, onEdit }) => {
    const [formData, setFormData] = useState({ ...team });
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
            setFormData(initial);
        }
    }, [isOpen, team]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("socials.")) {
            const key = name.split(".")[1];
            setFormData((prevData) => ({
                ...prevData,
                socials: {
                    ...prevData.socials,
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
                            ? e.target.value.replace(/[^0-9]/g, "")
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

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                status: (formData.status || [])
                    .filter((s) => s.position && s.joined !== "")
                    .map((s) => ({
                        position: s.position,
                        joined: Number(s.joined)
                    }))
            };
            await axios.patch(`/api/v1/teams/${team.usn}`, payload);
            toast({
                title: "Updated",
                description: `${team.name}'s details have been updated successfully.`,
                status: "success",
                duration: 5000,
                isClosable: true
            });
            onEdit(formData);
            onClose();
        } catch (error) {
            console.error("Error updating team member:", error);
            toast({
                title: "Error",
                description: "Unable to update team member.",
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Team Member</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={4}>
                        <FormControl>
                            <FormLabel>Index</FormLabel>
                            <Input
                                name="index"
                                value={formData.index}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Domain</FormLabel>
                            <Select
                                name="domain"
                                value={formData.domain}
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
                                    <FormControl>
                                        <FormLabel>Position</FormLabel>
                                        <Select
                                            name={`status.${i}.position`}
                                            value={row.position}
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
                                    <FormControl>
                                        <FormLabel>Year</FormLabel>
                                        <Input
                                            type="number"
                                            name={`status.${i}.joined`}
                                            value={row.joined}
                                            onChange={handleInputChange}
                                        />
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
                                value={formData.caption}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Picture URL</FormLabel>
                            <Input
                                name="pictureUrl"
                                value={formData.pictureUrl}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>GitHub</FormLabel>
                            <Input
                                name="socials.github"
                                value={formData.socials.github}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Website</FormLabel>
                            <Input
                                name="socials.website"
                                value={formData.socials.website}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>LinkedIn</FormLabel>
                            <Input
                                name="socials.linkedin"
                                value={formData.socials.linkedin}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Twitter</FormLabel>
                            <Input
                                name="socials.twitter"
                                value={formData.socials.twitter}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>SRM Mail ID</FormLabel>
                            <Input
                                name="socials.srmMailID"
                                value={formData.socials.srmMailID}
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
