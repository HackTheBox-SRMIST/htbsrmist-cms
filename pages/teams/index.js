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
import AddNew from "@/components/Teams/AddNew";
import withAuth from "@/components/withAuth";
import LoadingSpinner from "@/components/shared/Loading";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [domain, setDomain] = useState("");
    const [position, setPosition] = useState("");
    const [isCurrent, setIsCurrent] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [loading, setLoading] = useState(true);
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
        }finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setIsFiltering(true);
        fetchTeams().finally(() => setIsFiltering(false));
    };

    const handleDeleteTeam = () => {
        fetchTeams();
    };

    const handleEditTeam = () => {
        fetchTeams();
    };

    const handleAddTeam = () => {
        fetchTeams();
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <div className="bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color">
            <div className="container mx-auto" p={4}>
                <h1 className="text-3xl font-bold text-start px-2 pt-4 mb-8">
                    Team Page
                </h1>
                <div className="px-2">
                <AddNew onSuccess={handleAddTeam} />
                </div>
                <div className="flex flex-col md:flex-row justify-evenly gap-4 items-center py-8 my-8 bg-light-success-background dark:bg-[#777c78] rounded-2xl ">
                    <div className="w-[80%] md:w-[30%]">
                        <FormControl>
                            <FormLabel htmlFor="domain">Domain</FormLabel>
                            <Select
                                id="domain"
                                placeholder="Select domain"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                color="black"
                            >
                                <option value="">All</option>
                                <option value="Development">Development</option>
                                <option value="Cyber Security">
                                    Cyber Security
                                </option>
                                <option value="Creatives">Creatives</option>
                                <option value="Corporate">Corporate</option>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="w-[80%] md:w-[30%]">
                        <FormControl>
                            <FormLabel htmlFor="position">Position</FormLabel>
                            <Select
                                id="position"
                                placeholder="Select position"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                color="black"
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
                    </div>
                    <div className="w-[80%] md:w-[15%]">
                        <FormControl display="flex" alignItems="center">
                            <Checkbox
                                id="isCurrent"
                                isChecked={isCurrent}
                                onChange={(e) => setIsCurrent(e.target.checked)}
                            >
                                Current Member
                            </Checkbox>
                        </FormControl>
                    </div>
                    <div className="w-[80%] md:w-[15%]">
                        <Button
                            colorScheme="teal"
                            onClick={handleFilter}
                            isLoading={isFiltering}
                        >
                            Filter
                        </Button>
                    </div>
                </div>
                <Box>
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                        gap={4}
                    >
                        {teams.map((team) => (
                            <TeamCard
                                key={team.usn}
                                team={team}
                                onDelete={handleDeleteTeam}
                                onEdit={handleEditTeam}
                            />
                        ))}
                    </Box>
                </Box>
            </div>
        </div>
    );
};

export default withAuth(TeamPage);
