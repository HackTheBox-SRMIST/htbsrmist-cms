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
    Checkbox,
    Stack,
    Textarea,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import axios from "axios";

const AddEvent = ({ onSuccess }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [formData, setFormData] = useState({
        event_name: "",
        slug: "",
        rsvpLimit: 200,
        event_description: "",
        event_date: "",
        event_time: "",
        is_active: false,
        venue: "",
        duration: 0,
        prerequisites: [
            "Laptop Fully Charged",
            "VMWare or Virtual Box",
            "Preinstalled. - Security Oriented Operating System(Kali Linux is recommended) installed in the above mentioned Virtualization tools."
        ],
        cost: 0,
        poster_url: "",
        registration_url: "",
        speakers_details: [
            {
                name: "Dr. M. Lakshmi",
                designation:"Associate Professor, HoD Networking and Communications"
            },
            {
                name: "Dr. Joseph Raymond V",
                details: "",
                designation: "Faculty Convener, HackTheBox Chennai"
            },
        ],
        sponsors_details: [],
        teamEvent: false,
        teamSize: 0,
        database: "",
        collection: {
            participants: "organizers",
            organizers: "participants",
            volunteers: "volunteers"
        },
        certificate: {
            organizers: "None",
            participants: "None",
            volunteers: "None"
        },
        jimp_config: {
            yOffset: "10",
            color: "black",
            font_size: "64"
        }
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleNestedChange = (type, field, value) => {
        setFormData({
            ...formData,
            [type]: {
                ...formData[type],
                [field]: value
            }
        });
    };

    const handleArrayChange = (field, index, key, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index][key] = value;
        setFormData({
            ...formData,
            [field]: updatedArray
        });
    };

    const addArrayItem = (field, newItem) => {
        setFormData({
            ...formData,
            [field]: [...formData[field], newItem]
        });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("/api/v1/events", formData);
            toast({
                title: "Event added.",
                description: "The new event has been added successfully.",
                status: "success",
                duration: 5000,
                isClosable: true
            });
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error adding the event.",
                status: "error",
                duration: 5000,
                isClosable: true
            });
            console.error("Error adding event:", error);
        }
    };

    return (
        <>
            <Button colorScheme="teal" onClick={onOpen}>
                Add New Event
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Event</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Event Name</FormLabel>
                                <Input
                                    name="event_name"
                                    value={formData.event_name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Slug</FormLabel>
                                <Input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>RSVP Limit</FormLabel>
                                <Input
                                    name="rsvpLimit"
                                    type="number"
                                    value={formData.rsvpLimit}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Event Description</FormLabel>
                                <Textarea
                                    name="event_description"
                                    value={formData.event_description}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Event Date</FormLabel>
                                <Input
                                    name="event_date"
                                    type="date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Event Time</FormLabel>
                                <Input
                                    name="event_time"
                                    type="text"
                                    value={formData.event_time}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Venue</FormLabel>
                                <Input
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Duration (in hours)</FormLabel>
                                <Input
                                    name="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Prerequisites</FormLabel>
                                <Stack spacing={2}>
                                    {formData.prerequisites.map(
                                        (item, index) => (
                                            <Input
                                                key={index}
                                                value={item}
                                                onChange={(e) => {
                                                    const updated = [
                                                        ...formData.prerequisites
                                                    ];
                                                    updated[index] =
                                                        e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        prerequisites: updated
                                                    });
                                                }}
                                            />
                                        )
                                    )}
                                    <Button
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                prerequisites: [
                                                    ...formData.prerequisites,
                                                    ""
                                                ]
                                            })
                                        }
                                    >
                                        Add Prerequisite
                                    </Button>
                                </Stack>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Cost</FormLabel>
                                <Input
                                    name="cost"
                                    type="number"
                                    value={formData.cost}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Poster URL</FormLabel>
                                <Input
                                    name="poster_url"
                                    value={formData.poster_url}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Registration URL</FormLabel>
                                <Input
                                    name="registration_url"
                                    value={formData.registration_url}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Speakers Details</FormLabel>
                                <Stack spacing={2}>
                                    {formData.speakers_details.map(
                                        (speaker, index) => (
                                            <Stack
                                                key={index}
                                                spacing={2}
                                                direction="row"
                                            >
                                                <Input
                                                    placeholder="Name"
                                                    value={speaker.name}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "speakers_details",
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Input
                                                    placeholder="Designation"
                                                    value={speaker.designation}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "speakers_details",
                                                            index,
                                                            "designation",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Input
                                                    placeholder="Details"
                                                    value={speaker.details}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "speakers_details",
                                                            index,
                                                            "details",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Stack>
                                        )
                                    )}
                                    <Button
                                        onClick={() =>
                                            addArrayItem("speakers_details", {
                                                name: "",
                                                designation: "",
                                                details: ""
                                            })
                                        }
                                    >
                                        + Add Speaker
                                    </Button>
                                </Stack>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Sponsors Details</FormLabel>
                                <Stack spacing={2}>
                                    {formData.sponsors_details.map(
                                        (sponsor, index) => (
                                            <Stack
                                                key={index}
                                                spacing={2}
                                                direction="row"
                                            >
                                                <Input
                                                    placeholder="Name"
                                                    value={sponsor.name}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "sponsors_details",
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Input
                                                    placeholder="Place"
                                                    value={sponsor.place}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "sponsors_details",
                                                            index,
                                                            "place",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Input
                                                    placeholder="Details"
                                                    value={sponsor.details}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "sponsors_details",
                                                            index,
                                                            "details",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Stack>
                                        )
                                    )}
                                    <Button
                                        onClick={() =>
                                            addArrayItem("sponsors_details", {
                                                name: "",
                                                place: "",
                                                details: ""
                                            })
                                        }
                                    >
                                        + Add Sponsor
                                    </Button>
                                </Stack>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Database</FormLabel>
                                <Input
                                    name="database"
                                    value={formData.database}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Certificate - Organizers</FormLabel>
                                <Input
                                    value={formData.certificate.organizers}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "certificate",
                                            "organizers",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>
                                    Certificate - Participants
                                </FormLabel>
                                <Input
                                    value={formData.certificate.participants}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "certificate",
                                            "participants",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Certificate - Volunteers</FormLabel>
                                <Input
                                    value={formData.certificate.volunteers}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "certificate",
                                            "volunteers",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Jimp Config - Y Offset</FormLabel>
                                <Input
                                    value={formData.jimp_config.yOffset}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "jimp_config",
                                            "yOffset",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Jimp Config - Color</FormLabel>
                                <Input
                                    value={formData.jimp_config.color}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "jimp_config",
                                            "color",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Jimp Config - Font Size</FormLabel>
                                <Input
                                    value={formData.jimp_config.font_size}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "jimp_config",
                                            "font_size",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Is Active</FormLabel>
                                <Checkbox
                                    name="is_active"
                                    isChecked={formData.is_active}
                                    onChange={handleChange}
                                >
                                    Active Event
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

export default AddEvent;
