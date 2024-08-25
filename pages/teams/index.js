import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Select,
    Stack,
    Text,
    useToast
} from "@chakra-ui/react";
import TeamCard from "@/components/Teams/Card";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [domain, setDomain] = useState("");
    const [position, setPosition] = useState("");
    const [isCurrent, setIsCurrent] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const toast = useToast();

    const fetchTeams = async () => {
        try {
            const response = await axios.get("/api/v1/teams", {
                params: {
                    domain,
                    position,
                    isCurrent
                }
            });
            setTeams(response.data.data);
        } catch (error) {
            console.error("Error fetching teams:", error);
            toast({
                title: "Error",
                description: "Unable to fetch teams.",
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
    };

    const handleFilter = () => {
        setIsFiltering(true);
        fetchTeams().finally(() => setIsFiltering(false));
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    return (
        <Box className="container mx-auto" p={4}>
            <Text fontSize="4xl" fontWeight="bold" mb={4}>
                Team Page
            </Text>
            <Text fontSize="lg" mb={4}>
                Meet our awesome teams!
            </Text>
            <Stack spacing={4} mb={6}>
                <FormControl>
                    <FormLabel htmlFor="domain">Domain</FormLabel>
                    <Select
                        id="domain"
                        placeholder="Select domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Development">Development</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="Creatives">Creatives</option>
                        <option value="Corporate">Corporate</option>
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="position">Position</FormLabel>
                    <Select
                        id="position"
                        placeholder="Select position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Mainframe">Mainframe</option>
                        <option value="Kernel">Kernel</option>
                        <option value="Root">Root</option>
                        <option value="Sudoer">Sudoer</option>
                        <option value="Sticky Bit">Sticky Bit</option>
                        <option value="Binary">Binary</option>
                    </Select>
                </FormControl>
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="isCurrent" mb="0">
                        Current Teams
                    </FormLabel>
                    <Checkbox
                        id="isCurrent"
                        isChecked={isCurrent}
                        onChange={(e) => setIsCurrent(e.target.checked)}
                    >
                        Only current
                    </Checkbox>
                </FormControl>
                <Button
                    colorScheme="teal"
                    onClick={handleFilter}
                    isLoading={isFiltering}
                >
                    Filter
                </Button>
            </Stack>
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Teams
                </Text>
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                    gap={4}
                >
                    {teams.map((team) => (
                        <TeamCard key={team.email} team={team} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default TeamPage;
