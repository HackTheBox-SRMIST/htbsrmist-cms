import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
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

const getStatusForYear = (team, year) => {
    if (Array.isArray(team.status) && team.status.length > 0) {
        return (
            team.status.find((s) => Number(s?.joined) === Number(year)) || null
        );
    }
    if (Number(team.joined) === Number(year)) {
        return { position: team.position, joined: Number(team.joined) };
    }
    return null;
};

const getLatestStatus = (team) => {
    if (Array.isArray(team.status) && team.status.length > 0) {
        return team.status.reduce(
            (acc, s) =>
                !acc || (Number(s?.joined) || 0) > (Number(acc?.joined) || 0)
                    ? s
                    : acc,
            null
        );
    }
    return { position: team.position, joined: Number(team.joined) || 0 };
};

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [domain, setDomain] = useState("");
    const [position, setPosition] = useState("");
    const [currentFilter, setCurrentFilter] = useState("all");
    const [selectedYear, setSelectedYear] = useState("All");
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

        return teams.filter((team) => {
            // Search query filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const nameMatch = team.name?.toLowerCase().includes(q);
                const memberMatch = team.members?.some((member) =>
                    member.name?.toLowerCase().includes(q)
                );
                if (!nameMatch && !memberMatch) return false;
            }

            // Domain filter
            if (domain && team.domain !== domain) {
                return false;
            }

            const memberYears = getMemberYears(team);

            // Year and Position coordination
            if (selectedYear && selectedYear !== "All") {
                const yrNum = Number(selectedYear);
                const statusInYear = getStatusForYear(team, yrNum);

                // Member must have a status entry in the selected year
                if (!statusInYear) return false;

                // Position must match the role held in that specific selected year
                if (position && statusInYear.position !== position) {
                    return false;
                }

                // Current Member filter for specific year:
                // If member is marked false, they are ONLY false in their last (latest) year.
                // In earlier years they participated in, they were active (true).
                const latestYear = getMemberLatestYear(team);
                const isFalseInThisYear =
                    team.isCurrent === false && yrNum === latestYear;
                const isTrueInThisYear = !isFalseInThisYear;

                if (currentFilter === "true" && !isTrueInThisYear) {
                    return false;
                }
                if (currentFilter === "false" && !isFalseInThisYear) {
                    return false;
                }

                return true;
            }

            // When Year is "All":
            // Check Current Member filter
            if (currentFilter === "true") {
                if (team.isCurrent === false) {
                    return false;
                }
            } else if (currentFilter === "false") {
                if (team.isCurrent !== false) {
                    return false;
                }
            }

            // Check Position filter when Year is "All"
            if (position) {
                if (currentFilter === "true") {
                    const activeStatus =
                        getStatusForYear(team, currentYear) ||
                        getLatestStatus(team);
                    if (activeStatus?.position !== position) return false;
                } else {
                    const hasPosition =
                        Array.isArray(team.status) && team.status.length > 0
                            ? team.status.some((s) => s?.position === position)
                            : team.position === position;
                    if (!hasPosition) return false;
                }
            }

            return true;
        });
    }, [teams, searchQuery, domain, position, selectedYear, currentFilter]);

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <div className="min-h-screen bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color pb-16">
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

                <div className="flex flex-col md:flex-row justify-evenly gap-4 items-center py-6 my-8 bg-light-success-background dark:bg-[#777c78] rounded-2xl flex-wrap px-4">
                    <div className="w-[85%] sm:w-[45%] md:w-[22%]">
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
                    <div className="w-[85%] sm:w-[45%] md:w-[22%]">
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
                    <div className="w-[85%] sm:w-[45%] md:w-[22%]">
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
                    <div className="w-[85%] sm:w-[45%] md:w-[22%]">
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
                </div>
                {filteredTeams.length > 0 ? (
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
                ) : (
                    <div className="w-full flex justify-center items-center py-16 px-4">
                        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium">
                            No results found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(TeamPage);

