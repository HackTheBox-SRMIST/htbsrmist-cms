import React from 'react';
import {
    Menu,
    MenuButton,
    MenuList,
    VStack,
    Box,
    Checkbox,
    Button
} from "@chakra-ui/react";

const SelectJSONFields = ({ selectedJsonFields, handleJsonFieldChange }) => {
    return (
        <Menu>
            <MenuButton as={Button} colorScheme="green">
                Select JSON Fields
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.600" color="white" zIndex={10}>
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
            </MenuList>
        </Menu>
    );
};

export default SelectJSONFields;