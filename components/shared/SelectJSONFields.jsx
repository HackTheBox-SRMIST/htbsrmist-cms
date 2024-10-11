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
            <MenuButton as={Button} colorScheme="blue">
                Select JSON Fields
            </MenuButton>
            <MenuList>
                <VStack align="start" spacing={1}>
                    {Object.entries(selectedJsonFields).map(([field, isSelected]) => (
                        <Box key={field} ml={3}>
                            <Checkbox
                                value={field}
                                isChecked={isSelected}
                                onChange={() => handleJsonFieldChange(field)}
                            >
                                {field === 'reg_no' ? 'Reg No' : field === 'ph_no' ? 'Phone No' : field.charAt(0).toUpperCase() + field.slice(1)}
                            </Checkbox>
                        </Box>
                    ))}
                </VStack>
            </MenuList>
        </Menu>
    );
};

export default SelectJSONFields;