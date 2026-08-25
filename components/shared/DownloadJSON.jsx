import React, { useState, useCallback } from 'react';
import { 
    Button, 
    useDisclosure, 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalFooter, 
    ModalBody, 
    ModalCloseButton,
    VStack,
    Box,
    Checkbox,
    Flex,
    Text
} from "@chakra-ui/react";

const DownloadJSON = ({ data, fileName = 'data', filters }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedJsonFields, setSelectedJsonFields] = useState({
        name: true,
        email: true,
        reg_no: true,
        ph_no: false,
        linkedin: false,
        portfolio: false,
        resume: false,
        year: true,
        domain1: true,
        domain2: true,
    });

    const isFiltered = filters && (filters.domain1.length > 0 || filters.domain2.length > 0);

    const handleJsonFieldChange = useCallback((field) => {
        setSelectedJsonFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    }, []);

    const convertToJSON = useCallback((data) => {
        return JSON.stringify(
            data.map(item => {
                const jsonItem = {};
                if (selectedJsonFields.name) jsonItem.name = item.name;
                if (selectedJsonFields.email) jsonItem.email = item.email;
                if (selectedJsonFields.reg_no) jsonItem.reg_no = item.usn;
                if (selectedJsonFields.year) {
                    const currentYear = new Date().getFullYear().toString().slice(-2);
                    const usnYear = item.usn ? item.usn.substring(2, 4) : "";
                    jsonItem.year = usnYear === currentYear ? "1st" : "2nd";
                }
                if (selectedJsonFields.domain1) jsonItem.domain1 = item.domain1;
                if (selectedJsonFields.domain2) jsonItem.domain2 = item.domain2;
                if (selectedJsonFields.ph_no) jsonItem.ph_no = item.phone;
                if (selectedJsonFields.linkedin) jsonItem.linkedin = item.linkedin;
                if (selectedJsonFields.portfolio) jsonItem.portfolio = item.additionalLink;
                if (selectedJsonFields.resume) jsonItem.resume = item.resume;
                return jsonItem;
            }),
            null,
            2
        );
    }, [selectedJsonFields]);

    const handleDownloadJSON = useCallback(() => {
        if (data && data.length > 0) {
            const json = convertToJSON(data);
            const blob = new Blob([json], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onClose();
        } else {
            console.warn("No data to download.");
        }
    }, [data, convertToJSON, fileName, onClose]);

    return (
        <>
            <Button colorScheme="green" onClick={onOpen}>
                Download JSON
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="gray.800" color="white">
                    <ModalHeader>Select JSON Fields</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align="start" spacing={4}>
                            <Box bg="gray.700" p={3} borderRadius="md" w="full" borderLeft="4px solid" borderColor="green.400">
                                <Text fontSize="sm" color="green.300" textAlign="center">
                                    <Text as="span" fontWeight="bold">{isFiltered ? "Note:" : "Tip:"}</Text> {
                                        isFiltered 
                                            ? "You are downloading data according to your active Domain filters on the page."
                                            : "You can use the Domain filters on the main page to download specific candidates!"
                                    }
                                </Text>
                            </Box>
                            <VStack align="start" spacing={1}>
                                {Object.entries(selectedJsonFields).map(([field, isSelected]) => (
                                    <Box key={field} ml={3}>
                                        <Checkbox
                                            value={field}
                                            isChecked={isSelected}
                                            onChange={() => handleJsonFieldChange(field)}
                                            colorScheme="green"
                                        >
                                            {field === 'reg_no' ? 'Reg No' : field === 'ph_no' ? 'Phone No' : field === 'linkedin' ? 'LinkedIn' : field.charAt(0).toUpperCase() + field.slice(1)}
                                        </Checkbox>
                                    </Box>
                                ))}
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Flex w="full" justify="center" gap={4}>
                            <Button colorScheme="green" onClick={handleDownloadJSON}>
                                Download
                            </Button>
                            <Button variant="ghost" _hover={{ bg: "gray.700" }} onClick={onClose}>
                                Cancel
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DownloadJSON;