import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Select,
    useToast
} from "@chakra-ui/react";
import TeamCard from "@/components/Teams/Card";
import AddNew from "@/components/Teams/AddNew";
import withAuth from "@/components/withAuth";
import LoadingSpinner from "@/components/shared/Loading";
import SearchBar from "@/components/shared/SearchBar";
import {
    buildYearOptions,
    formatTeamYear,
    getMemberYears,
    getMemberLatestYear
} from "@/utils/misc/years";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [domain, setDomain] = useState("");
    const [position, setPosition] = useState("");
    const [currentFilter, setCurrentFilter] = useState("all");
    const [selectedYear, setSelectedYear] = useState("All");
    const [isFiltering, setIsFiltering] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const toast = useToast();

    const fetchTeams = async () => {
        try {
            const response = await axios.get("/api/v1/teams");
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
        } finally {
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

    const yearOptions = useMemo(() => {
        return buildYearOptions(teams);
    }, [teams]);

    const filteredTeams = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return teams
            .filter((team) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                const nameMatch = team.name?.toLowerCase().includes(q);
                const memberMatch = team.members?.some((member) =>
                    member.name?.toLowerCase().includes(q)
                );
                return nameMatch || memberMatch;
            })
            .filter((team) => {
                if (!domain) return true;
                return team.domain === domain;
            })
            .filter((team) => {
                if (!position) return true;
                const latest =
                    Array.isArray(team.status) && team.status.length > 0
                        ? team.status.reduce(
                              (acc, s) =>
                                  !acc ||
                                  (s?.joined ?? 0) > (acc?.joined ?? 0)
                                      ? s
                                      : acc,
                              null
                          )
                        : { position: team.position };
                return (latest?.position || "") === position;
            })
            .filter((team) => {
                const memberYears = getMemberYears(team);

                // When a specific year is chosen in the Year dropdown
                if (selectedYear && selectedYear !== "All") {
                    const yrNum = Number(selectedYear);
                    if (!memberYears.includes(yrNum)) return false;

                    if (currentFilter === "true") {
                        if (yrNum === currentYear) {
                            return team.isCurrent !== false;
                        }
                        // For past years, like main site: if inactive, hide from latest year
                        if (team.isCurrent === false) {
                            const latestYear = getMemberLatestYear(team);
                            return yrNum !== latestYear;
                        }
                        return true;
                    }
                    if (currentFilter === "false") {
                        return team.isCurrent === false;
                    }
                    return true;
                }

                // When Year is "All":
                if (currentFilter === "true") {
                    // "current year means if not in 2026 then he is not current member of 2026"
                    return (
                        memberYears.includes(currentYear) &&
                        team.isCurrent !== false
                    );
                }
                if (currentFilter === "false") {
                    // Past/inactive: either not in current year or isCurrent is false
                    return (
                        !memberYears.includes(currentYear) ||
                        team.isCurrent === false
                    );
                }

                return true;
            });
    }, [teams, searchQuery, domain, position, selectedYear, currentFilter]);

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <div className="bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color">
            <div className="container mx-auto" p={4}>
                <h1 className="text-3xl font-bold text-start px-2 pt-4 mb-8">
                    Team Page
                </h1>
                <div className="px-2 mb-6 flex items-center gap-4">
                    <SearchBar
                        className="flex-grow mr-0"
                        placeholder="Search members by name..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                    <div className="relative" style={{ top: "-12px" }}>
                        <AddNew
                            onSuccess={handleAddTeam}
                            existingYears={yearOptions}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-evenly gap-4 items-center py-8 my-8 bg-light-success-background dark:bg-[#777c78] rounded-2xl flex-wrap">
                    <div className="w-[80%] md:w-[19%]">
                        <FormControl>
                            <FormLabel htmlFor="domain">Domain</FormLabel>
                            <Select
                                id="domain"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                color="black"
                            >
                                <option value="">All</option>
                                <option value="Development">Development</option>
                                <option value="Creatives">Creatives</option>
                                <option value="Cyber Security">
                                    Cyber Security
                                </option>
                                <option value="Corporate">Corporate</option>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="w-[80%] md:w-[19%]">
                        <FormControl>
                            <FormLabel htmlFor="position">Position</FormLabel>
                            <Select
                                id="position"
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
                    <div className="w-[80%] md:w-[19%]">
                        <FormControl>
                            <FormLabel htmlFor="year">Year</FormLabel>
                            <Select
                                id="year"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                color="black"
                            >
                                <option value="All">All Years</option>
                                {yearOptions.map((yr) => (
                                    <option key={yr} value={yr}>
                                        {formatTeamYear(yr)}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="w-[80%] md:w-[19%]">
                        <FormControl>
                            <FormLabel htmlFor="isCurrent">
                                Current Member
                            </FormLabel>
                            <Select
                                id="isCurrent"
                                value={currentFilter}
                                onChange={(e) => setCurrentFilter(e.target.value)}
                                color="black"
                            >
                                <option value="all">All</option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="w-[80%] md:w-[10%]">
                        <Button
                            colorScheme="teal"
                            onClick={handleFilter}
                            isLoading={isFiltering}
                        >
                            Filter
                        </Button>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center items-stretch gap-x-2 sm:gap-x-3 lg:gap-x-3.5 gap-y-2 sm:gap-y-4 w-full mt-0.5 mb-1 sm:my-2">
                    {filteredTeams.map((team) => (
                        <div
                            key={team.usn}
                            className="w-[calc(50%-6px)] sm:w-[calc(33.333%-10px)] md:w-[calc(25%-10px)] lg:w-[calc(16.666%-12px)] max-w-[195px] sm:max-w-[210px] flex justify-center items-stretch shrink-0 self-stretch"
                        >
                            <TeamCard
                                team={team}
                                onDelete={handleDeleteTeam}
                                onEdit={handleEditTeam}
                                existingYears={yearOptions}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default withAuth(TeamPage);

