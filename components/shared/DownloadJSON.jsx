import React, { useCallback } from 'react';
import { Button } from "@chakra-ui/react";

const DownloadJSON = ({ filteredData, fileName = 'data', selectedJsonFields }) => {
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
        if (filteredData && filteredData.length > 0) {
            const json = convertToJSON(filteredData);
            const blob = new Blob([json], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.warn("No data to download.");
        }
    }, [filteredData, convertToJSON, fileName]);

    return (
        <Button colorScheme="green" onClick={handleDownloadJSON}>
            Download JSON
        </Button>
    );
};

export default DownloadJSON;