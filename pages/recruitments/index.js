import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
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
    Center,
    Flex,
    Heading,
    Link,
    Select,
    Spinner,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Text,
} from "@chakra-ui/react";
import withAuth from "@/components/withAuth";

// Register necessary Chart.js components
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

    const domainsList = [
        "Cyber Security",
        "Development",
        "Corporate",
        "Creatives"
    ];

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, []);

    const determineYear = (usn) => {
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const usnYear = usn.substring(2, 4);
        return usnYear === currentYear ? "1st" : "2nd";
    };

    const processDomains = (data) => {
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

            // Process domain1
            if (item.domain1 && domainsList.includes(item.domain1)) {
                domain1Count[item.domain1] += 1;
            }

            // Process domain2
            if (item.domain2 && domainsList.includes(item.domain2)) {
                domain2Count[item.domain2] += 1;
            }

            if (yearKey === "firstYear") firstYear++;
            else if (yearKey === "secondYear") secondYear++;
        });

        setDomains1(domain1Count);
        setDomains2(domain2Count);
        setYearCounts({ firstYear, secondYear });
    };

    const handleShowTable = () => setShowTable(!showTable);

    const domain1ChartData = useMemo(
        () => ({
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
        }),
        [domains1]
    );

    const domain2ChartData = useMemo(
        () => ({
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
        }),
        [domains2]
    );

    if (loading)
        return (
            <Center>
                <Spinner size="xl" />
            </Center>
        );
    if (error)
        return (
            <Center>
                <Text color="red.500">{error}</Text>
            </Center>
        );

    return (
        <Box p={5}>
            <Heading size="lg" mb={4}>
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

            {showTable && (
                <Box overflowX="auto" mt={4}>
                    <Table variant="striped" colorScheme="gray">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Reg No</Th>
                                <Th>Year</Th>
                                <Th>Domains</Th>
                                <Th>Links</Th>
                                <Th>Phone</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recruitmentData.map((record) => (
                                <Tr key={record._id}>
                                    <Td>{record.name}</Td>
                                    <Td>{record.usn}</Td>
                                    <Td>{determineYear(record.usn)}</Td>
                                    <Td>
                                        {[record.domain1, record.domain2]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </Td>
                                    <Td>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "10px"
                                            }}
                                        >
                                            {record.linkedin && (
                                                <Link color='teal.500'
                                                    href={record.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="LinkedIn"
                                                    variant="outline"
                                                    size="sm"
                                                >Linkedin</Link>
                                            )}
                                            {record.additionalLink && (
                                                <Link color='teal.500'
                                                    href={record.additionalLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Portfolio"
                                                    variant="outline"
                                                    size="sm"
                                                >Portfolio</Link>
                                            )}
                                            {record.resume && (
                                                <Link color='teal.500'
                                                    href={record.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Resume"
                                                    variant="outline"
                                                    size="sm"
                                                >Resume</Link>
                                            )}
                                        </div>
                                    </Td>
                                    <Td>{record.phone}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};

export default withAuth(Recruitment);
