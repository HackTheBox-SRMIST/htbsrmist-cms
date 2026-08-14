import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
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
    Center
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
        resume: false
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
                                <MenuButton as={Button} colorScheme="blue">
                                    Filter Domain 1
                                </MenuButton>
                                <MenuList> 
                                    <VStack align="start" spacing={1}>
                                        {domainsList.map(domain => (
                                            <Box key={domain} ml={3}> 
                                                <Checkbox
                                                    value={domain}
                                                    isChecked={filters.domain1.includes(domain)}
                                                    onChange={() => handleFilterChange('domain1', domain)}
                                                >
                                                    {domain}
                                                </Checkbox>
                                            </Box>
                                        ))}
                                    </VStack>
                                </MenuList>
                            </Menu>

                            <Menu>
                                <MenuButton as={Button} colorScheme="blue">
                                    Filter Domain 2
                                </MenuButton>
                                <MenuList> 
                                    <VStack align="start">
                                        {domainsList.map(domain => (
                                            <Box key={domain} ml={3}> 
                                                <Checkbox
                                                    value={domain}
                                                    isChecked={filters.domain2.includes(domain)}
                                                    onChange={() => handleFilterChange('domain2', domain)}
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
        </div>
    );
};

export default withAuth(Recruitment);
