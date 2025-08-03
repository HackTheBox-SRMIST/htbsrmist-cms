import React, { useState } from "react";
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
    Input,
    Select,
    Checkbox,
    Stack,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import axios from "axios";

const AddNew = ({ onSuccess }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [formData, setFormData] = useState({
        index: "",
        usn: "",
        name: "",
        domain: "",
        position: "",
        caption: "",
        joined: "",
        pictureUrl: "",
        isCurrent: true,
        socials: {
            github: "",
            website: "",
            linkedin: "",
            twitter: "",
            srmMailID: ""
        }
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else if (name.includes("socials")) {
            const socialKey = name.split(".")[1];
            setFormData({
                ...formData,
                socials: {
                    ...formData.socials,
                    [socialKey]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post("/api/v1/teams", formData);
            // console.log("Form data:", formData);
            toast({
                title: "Member added.",
                description: "The new member has been added successfully.",
                status: "success",
                duration: 5000,
                isClosable: true
            });
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error adding the member.",
                status: "error",
                duration: 5000,
                isClosable: true
            });
            console.error("Error adding member:", error);
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
                            <FormControl isRequired>
                                <FormLabel htmlFor="index">Index</FormLabel>
                                <Input
                                    id="index"
                                    name="index"
                                    type="number"
                                    value={formData.index}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="usn">USN</FormLabel>
                                <Input
                                    id="usn"
                                    name="usn"
                                    value={formData.usn}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="name">Name</FormLabel>
                                <Input
                                    id="name"
                                    name="name"
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
                                <FormLabel htmlFor="position">
                                    Position
                                </FormLabel>
                                <Select
                                    id="position"
                                    name="position"
                                    placeholder="Select position"
                                    value={formData.position}
                                    onChange={handleChange}
                                >
                                    <option value="Root">Root</option>
                                    <option value="Sudoer">Sudoer</option>
                                    <option value="Sticky Bit">
                                        Sticky Bit
                                    </option>
                                    <option value="Binary">Binary</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="caption">Caption</FormLabel>
                                <Input
                                    id="caption"
                                    name="caption"
                                    value={formData.caption}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="joined">
                                    Year Joined
                                </FormLabel>
                                <Input
                                    id="joined"
                                    name="joined"
                                    type="number"
                                    value={formData.joined}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor="pictureUrl">
                                    Picture URL
                                </FormLabel>
                                <Input
                                    id="pictureUrl"
                                    name="pictureUrl"
                                    value={formData.pictureUrl}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Socials</FormLabel>
                                <Stack spacing={2}>
                                    <Input
                                        name="socials.github"
                                        placeholder="GitHub URL"
                                        value={formData.socials.github}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        name="socials.website"
                                        placeholder="Website URL"
                                        value={formData.socials.website}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        name="socials.linkedin"
                                        placeholder="LinkedIn URL"
                                        value={formData.socials.linkedin}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        name="socials.twitter"
                                        placeholder="Twitter URL"
                                        value={formData.socials.twitter}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        name="socials.srmMailID"
                                        placeholder="SRM Mail ID"
                                        value={formData.socials.srmMailID}
                                        onChange={handleChange}
                                    />
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
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="teal" onClick={handleSubmit}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddNew;
