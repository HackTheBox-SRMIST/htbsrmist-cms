import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import * as XLSX from 'xlsx-js-style';
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from "chart.js";
import {
    Box,
    Button,
    Flex,
    Heading,
    Link,
    Checkbox,
    VStack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Text,
    Menu,
    MenuButton,
    MenuList,
    Center,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Radio,
    RadioGroup,
    Stack,
    Select,
    useToast
} from "@chakra-ui/react";

import withAuth from "@/components/withAuth";
import LoadingSpinner from "@/components/shared/Loading";
import DownloadJSON from "@/components/shared/DownloadJSON";
import SelectJSONFields from "@/components/shared/SelectJSONFields";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
);

const Recruitment = () => {
    const [recruitmentData, setRecruitmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [domains1, setDomains1] = useState({});
    const [domains2, setDomains2] = useState({});
    const [yearCounts, setYearCounts] = useState({
        firstYear: 0,
        secondYear: 0
    });
    const [filters, setFilters] = useState({
        domain1: [],
        domain2: [],
    });

    const { isOpen: isExcelModalOpen, onOpen: onExcelModalOpen, onClose: onExcelModalClose } = useDisclosure();
    const [excelDownloadType, setExcelDownloadType] = useState('both');
    const [excelDomainChoice, setExcelDomainChoice] = useState('');
    const toast = useToast();

    const domainsList = useMemo(() => [
        "Cyber Security",
        "Development",
        "Corporate",
        "Creatives"
    ], []);

    const [selectedJsonFields, setSelectedJsonFields] = useState({
        name: true,
        email: true,
        reg_no: false,
        ph_no: false,
        linkedin: false,
        portfolio: false,
        resume: false,
        year: false,
        domain1: false,
        domain2: false
    });

    const handleJsonFieldChange = useCallback((field) => {
        setSelectedJsonFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get("/api/v1/recruitments");
            const data = response.data.data;
            setRecruitmentData(data);
            processDomains(data);
        } catch (err) {
            setError(
                "Error fetching recruitment data. Please try again later."
            );
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const determineYear = useCallback((usn) => {
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const usnYear = usn.substring(2, 4);
        return usnYear === currentYear ? "1st" : "2nd";
    }, []);

    const processDomains = useCallback((data) => {
        const domain1Count = {};
        const domain2Count = {};

        domainsList.forEach((domain) => {
            domain1Count[domain] = 0;
            domain2Count[domain] = 0;
        });

        let firstYear = 0;
        let secondYear = 0;

        data.forEach((item) => {
            const yearKey =
                determineYear(item.usn) === "1st" ? "firstYear" : "secondYear";

            if (item.domain1 && domainsList.includes(item.domain1)) {
                domain1Count[item.domain1] += 1;
            }

            if (item.domain2 && domainsList.includes(item.domain2)) {
                domain2Count[item.domain2] += 1;
            }

            if (yearKey === "firstYear") firstYear++;
            else if (yearKey === "secondYear") secondYear++;
        });

        setDomains1(domain1Count);
        setDomains2(domain2Count);
        setYearCounts({ firstYear, secondYear });
    }, [domainsList, determineYear]);

    const handleShowTable = useCallback(() => setShowTable(prev => !prev), []);

    const handleFilterChange = useCallback((domainType, selectedDomains) => {
        setFilters(prev => {
            const currentSelections = prev[domainType];
            const isAlreadySelected = currentSelections.includes(selectedDomains);

            if (isAlreadySelected) {
                return {
                    ...prev,
                    [domainType]: currentSelections.filter(domain => domain !== selectedDomains),
                };
            } else {
                return {
                    ...prev,
                    [domainType]: [...currentSelections, selectedDomains],
                };
            }
        });
    }, []);

    const domain1ChartData = useMemo(() => ({
        labels: domainsList,
        datasets: [
            {
                label: "Domain1 Registrations",
                data: domainsList.map((domain) => domains1[domain] || 0),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0"
                ]
            }
        ]
    }), [domains1, domainsList]);

    const domain2ChartData = useMemo(() => ({
        labels: domainsList,
        datasets: [
            {
                label: "Domain2 Registrations",
                data: domainsList.map((domain) => domains2[domain] || 0),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0"
                ]
            }
        ]
    }), [domains2, domainsList]);

    const filteredData = useMemo(() => {
        return recruitmentData.filter(record => {
            const domain1Match = filters.domain1.length === 0 || filters.domain1.includes(record.domain1);
            const domain2Match = filters.domain2.length === 0 || filters.domain2.includes(record.domain2);
            return domain1Match && domain2Match;
        });
    }, [recruitmentData, filters]);

    const handleDownloadCSV = useCallback(() => {
        if (filteredData.length > 0) {
            const csv = convertToCSV(filteredData);
            const blob = new Blob([csv], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `recruitment_data.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.warn("No data to download.");
        }
    }, [filteredData]);

    const convertToCSV = (data) => {
        const header = Object.keys(data[0]).join(",") + "\n";
        const rows = data.map((row) =>
            Object.values(row)
                .map((value) => `"${value}"`)
                .join(",")
        );
        return header + rows.join("\n");
    };

    const executeExcelDownload = useCallback(() => {
        let finalData = recruitmentData;
        let sheetName = "Recruitments";
        
        if (excelDownloadType === 'domain1' && excelDomainChoice) {
            finalData = recruitmentData.filter(item => item.domain1 === excelDomainChoice);
            sheetName = excelDomainChoice.substring(0, 31);
        } else if (excelDownloadType === 'domain2' && excelDomainChoice) {
            finalData = recruitmentData.filter(item => item.domain2 === excelDomainChoice);
            sheetName = excelDomainChoice.substring(0, 31);
        } else if (excelDownloadType !== 'both') {
            console.warn("Please select a domain choice.");
            return;
        }

        if (finalData.length > 0) {
            const workbook = XLSX.utils.book_new();

            const dataToExport = finalData.map(item => {
                const rowData = {
                    Name: item.name || "",
                    Email: item.email || "",
                    "Reg No": item.usn || "",
                    Year: determineYear(item.usn),
                };

                if (excelDownloadType !== 'domain2') {
                    rowData["Domain 1"] = item.domain1 || "";
                }
                
                if (excelDownloadType !== 'domain1') {
                    rowData["Domain 2"] = item.domain2 || "";
                }

                rowData.Phone = item.phone || "";
                rowData.LinkedIn = item.linkedin || "";
                rowData.Portfolio = item.additionalLink || "";
                rowData.Resume = item.resume || "";

                return rowData;
            });
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            const range = XLSX.utils.decode_range(worksheet['!ref']);
            
            for (let C = 0; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ c: C, r: 0 });
                if (worksheet[address]) {
                    worksheet[address].s = { font: { bold: true } };
                }
            }

            const headers = Object.keys(dataToExport[0] || {});
            const idxLinkedIn = headers.indexOf("LinkedIn");
            const idxPortfolio = headers.indexOf("Portfolio");
            const idxResume = headers.indexOf("Resume");

            for(let R = 1; R <= range.e.r; ++R) {
                if (idxLinkedIn !== -1) {
                    const link = worksheet[XLSX.utils.encode_cell({c: idxLinkedIn, r: R})]; 
                    if (link && link.v) {
                        link.l = { Target: link.v };
                        link.v = "View LinkedIn"; 
                        link.s = { font: { color: { rgb: "0563C1" }, underline: true } };
                    }
                }
                
                if (idxPortfolio !== -1) {
                    const link = worksheet[XLSX.utils.encode_cell({c: idxPortfolio, r: R})]; 
                    if (link && link.v) {
                        link.l = { Target: link.v };
                        link.v = "View Portfolio";
                        link.s = { font: { color: { rgb: "0563C1" }, underline: true } };
                    }
                }
                
                if (idxResume !== -1) {
                    const link = worksheet[XLSX.utils.encode_cell({c: idxResume, r: R})]; 
                    if (link && link.v) {
                        link.l = { Target: link.v };
                        link.v = "View Resume";
                        link.s = { font: { color: { rgb: "0563C1" }, underline: true } };
                    }
                }
            }
            
            const colWidths = [];
            if (dataToExport.length > 0) {
                headers.forEach((header, i) => {
                    colWidths[i] = { wch: header.length + 2 }; 
                });

                dataToExport.forEach(row => {
                    Object.values(row).forEach((val, i) => {
                        const strVal = val ? val.toString() : "";
                        let displayLength = strVal.length;
                        if (i === idxLinkedIn) displayLength = 13; 
                        else if (i === idxPortfolio) displayLength = 14; 
                        else if (i === idxResume) displayLength = 11; 

                        if (displayLength + 2 > colWidths[i].wch) {
                            colWidths[i].wch = Math.min(displayLength + 2, 50); 
                        }
                    });
                });
            }
            worksheet['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            let fileName = 'recruitments_all.xlsx';
            if (excelDownloadType !== 'both') {
                const domainString = excelDownloadType === 'domain1' ? 'Domain1' : 'Domain2';
                fileName = `recruitments_${excelDomainChoice.replace(/\s+/g, '_')}_${domainString}.xlsx`;
            }
            
            XLSX.writeFile(workbook, fileName);
            onExcelModalClose();
        } else {
            toast({
                title: "No candidates found",
                description: excelDownloadType === 'both' 
                    ? "There are no registrations available to download." 
                    : `No candidates chose ${excelDomainChoice} as their ${excelDownloadType === 'domain1' ? 'First' : 'Second'} Preference.`,
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    }, [recruitmentData, determineYear, excelDownloadType, excelDomainChoice, onExcelModalClose, toast]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Center>
                <Text color="red.500">{error}</Text>
            </Center>
        );
    }

    return (
        <div className="bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color" >
            <Heading className="text-center pt-2" size="lg" mb={4}>
                Recruitment Data Statistics
            </Heading>
            <Text fontSize="lg" textAlign="center" fontWeight="bold" mb={4}>
                Total Registrations: {recruitmentData.length}
            </Text>
            <Flex justify="center" gap="10" textAlign="center" mb={4}>
                <Text fontSize="lg">
                    First Year: <strong>{yearCounts.firstYear}</strong>
                </Text>
                <Text fontSize="lg">
                    Second Year: <strong>{yearCounts.secondYear}</strong>
                </Text>
            </Flex>

            <Flex justify="space-around" mb={8}>
                <Box width="25%">
                    <Heading size="md" textAlign="center" mb={2}>
                        First Domain Preference
                    </Heading>
                    <Pie
                        data={domain1ChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true
                        }}
                    />
                </Box>
                <Box width="25%">
                    <Heading size="md" textAlign="center" mb={2}>
                        Second Domain Preference
                    </Heading>
                    <Pie
                        data={domain2ChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true
                        }}
                    />
                </Box>
            </Flex>

            <Flex justify="center" gap={8} my={5}>
                <Button colorScheme="blue" onClick={handleShowTable}>
                    {showTable ? "Hide Records" : "Show Records"}
                </Button>
            </Flex>

           

            <Flex justify="space-between" mb={4} gap={8}>
                {showTable && (
                    <>  
                        <Flex justify="left" gap={8} mb={4}>
                            <Button
                                colorScheme="green"
                                onClick={handleDownloadCSV}
                            >
                                Download CSV
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={onExcelModalOpen}
                            >
                                Download Excel
                            </Button>
                            <DownloadJSON
                                filteredData={filteredData}
                                fileName="recruitment_data"
                                selectedJsonFields={selectedJsonFields}
                            />
                        </Flex>
                        
                        <Flex justify="right" gap={8}>
                            <SelectJSONFields
                                selectedJsonFields={selectedJsonFields}
                                handleJsonFieldChange={handleJsonFieldChange}
                            />  
                            <Menu>
                                <MenuButton as={Button} colorScheme="green">
                                    Filter Domain 1
                                </MenuButton>
                                <MenuList bg="gray.800" borderColor="gray.600" color="white" zIndex={10}> 
                                    <VStack align="start" spacing={1}>
                                        {domainsList.map(domain => (
                                            <Box key={domain} ml={3}> 
                                                <Checkbox
                                                    value={domain}
                                                    isChecked={filters.domain1.includes(domain)}
                                                    onChange={() => handleFilterChange('domain1', domain)}
                                                    colorScheme="green"
                                                >
                                                    {domain}
                                                </Checkbox>
                                            </Box>
                                        ))}
                                    </VStack>
                                </MenuList>
                            </Menu>

                            <Menu>
                                <MenuButton as={Button} colorScheme="green">
                                    Filter Domain 2
                                </MenuButton>
                                <MenuList bg="gray.800" borderColor="gray.600" color="white" zIndex={10}> 
                                    <VStack align="start">
                                        {domainsList.map(domain => (
                                            <Box key={domain} ml={3}> 
                                                <Checkbox
                                                    value={domain}
                                                    isChecked={filters.domain2.includes(domain)}
                                                    onChange={() => handleFilterChange('domain2', domain)}
                                                    colorScheme="green"
                                                >
                                                    {domain}
                                                </Checkbox>
                                            </Box>
                                        ))}
                                    </VStack>
                                </MenuList>
                            </Menu>                          
                        </Flex>                        
                    </>
                )}
            </Flex>            

            {showTable && (
                <Box overflowX="auto" mt={4}>
                    <Text fontSize="lg" mb={4} textAlign="center" width="100%">
                        Displaying {filteredData.length} record{filteredData.length !== 1 ? 's' : ''} after filtering.
                    </Text>

                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Reg No</Th>
                                <Th>Year</Th>
                                <Th>Domain 1</Th>
                                <Th>Domain 2</Th>
                                <Th>Links</Th>
                                <Th>Phone</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredData.map((item, index) => (
                                <Tr key={index}>
                                    <Td>{item.name}</Td>
                                    <Td>{item.email}</Td>
                                    <Td>{item.usn}</Td>
                                    <Td>{determineYear(item.usn)}</Td>
                                    <Td>{item.domain1}</Td>
                                    <Td>{item.domain2}</Td> 
                                    <Td>
                                        <Flex gap={2}>
                                            {item.linkedin && (
                                                <Link
                                                    color='teal.500'
                                                    href={item.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="LinkedIn"
                                                >
                                                    LinkedIn
                                                </Link>
                                            )}
                                            {item.additionalLink && (
                                                <Link
                                                    color='teal.500'
                                                    href={item.additionalLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Portfolio"
                                                >
                                                    Portfolio
                                                </Link>
                                            )}
                                            {item.resume && (
                                                <Link
                                                    color='teal.500'
                                                    href={item.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Resume"
                                                >
                                                    Resume
                                                </Link>
                                            )}
                                        </Flex>
                                    </Td>
                                    <Td>{item.phone}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* Excel Download Modal */}
            <Modal isOpen={isExcelModalOpen} onClose={onExcelModalClose}>
                <ModalOverlay />
                <ModalContent bg="gray.800" color="white">
                    <ModalHeader>Download Excel Data</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align="start" spacing={4}>
                            <Text>Filter candidates by:</Text>
                            <RadioGroup onChange={setExcelDownloadType} value={excelDownloadType}>
                                <Stack direction='column' spacing={2}>
                                    <Radio value='domain1' colorScheme="green">Domain 1</Radio>
                                    <Radio value='domain2' colorScheme="green">Domain 2</Radio>
                                    <Radio value='both' colorScheme="green">Both (All Data)</Radio>
                                </Stack>
                            </RadioGroup>

                            {excelDownloadType !== 'both' && (
                                <Select 
                                    placeholder='Select domain' 
                                    value={excelDomainChoice}
                                    onChange={(e) => setExcelDomainChoice(e.target.value)}
                                    bg="gray.900"
                                    borderColor="gray.600"
                                    color="white"
                                    _hover={{ borderColor: "green.400" }}
                                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48bb78" }}
                                    sx={{
                                        '> option, > optgroup': {
                                            bg: 'gray.900',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    {domainsList.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </Select>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Flex w="full" justify="center" gap={4}>
                            <Button colorScheme="green" onClick={executeExcelDownload}>
                                Download
                            </Button>
                            <Button variant="ghost" _hover={{ bg: "gray.700" }} onClick={onExcelModalClose}>
                                Cancel
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default withAuth(Recruitment);
