import React, { useState } from "react";
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
    useToast
} from "@chakra-ui/react";
import axios from "axios";

const EditModal = ({ isOpen, onClose, team, onEdit }) => {
    const [formData, setFormData] = useState({ ...team });
    const toast = useToast();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            await axios.patch(`/api/v1/teams/${team.usn}`, formData);
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
                            <Input
                                name="domain"
                                value={formData.domain}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Position</FormLabel>
                            <Input
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                            />
                        </FormControl>
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
                            <FormLabel>Current Member</FormLabel>
                            <Input
                                name="isCurrent"
                                value={formData.isCurrent}
                                onChange={handleInputChange}
                            />
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
