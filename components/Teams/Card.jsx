import React, { useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Stack,
    Heading,
    Text,
    ButtonGroup,
    Button,
    Divider,
    Tooltip,
    useToast,
    useDisclosure
} from "@chakra-ui/react";
import axios from "axios";
import EditMember from "@/components/Teams/EditMember";

const TeamCard = ({ team, onDelete, onEdit }) => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v1/teams/${team.usn}`);
            toast({
                title: "Deleted",
                description: `${team.name} has been deleted successfully.`,
                status: "success",
                duration: 5000,
                isClosable: true
            });
            onDelete(team.usn);
        } catch (error) {
            console.error("Error deleting team member:", error);
            toast({
                title: "Error",
                description: "Unable to delete team member.",
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
    };

    const socials = team.socials;

    return (
        <>
            <Card maxW="sm">
                <CardBody>
                    <img
                        src={team.pictureUrl}
                        alt={team.name}
                        className="rounded-full border-2 border-solid border-htb-green/50  p-1 w-40 h-40 bg-cover bg-center object-cover brightness-125"
                    />
                    <Stack mt="6" spacing="3">
                        <Heading size="md">{team.name}</Heading>
                        <Text>{team.caption}</Text>
                        <Text color="blue.600" fontSize="lg">
                            Domain: {team.domain}
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                            Position: {team.position}
                        </Text>
                    </Stack>
                </CardBody>
                <Divider />
                <CardFooter className="flex-col gap-2">
                    <ul>
                        {Object.entries(socials).map(
                            ([platform, url], index) => (
                                <li key={index}>
                                    <Tooltip
                                        label={url}
                                        placement="top"
                                        hasArrow
                                    >
                                        <Button size="sm" variant="outline">
                                            {platform.charAt(0).toUpperCase() +
                                                platform.slice(1)}
                                        </Button>
                                    </Tooltip>
                                </li>
                            )
                        )}
                    </ul>
                    <ButtonGroup spacing="2">
                        <Button colorScheme="blue" onClick={onOpen}>
                            Edit
                        </Button>
                        <Button colorScheme="red" onClick={handleDelete}>
                            Delete
                        </Button>
                    </ButtonGroup>
                </CardFooter>
            </Card>

            <EditMember
                isOpen={isOpen}
                onClose={onClose}
                team={team}
                onEdit={onEdit}
            />
        </>
    );
};

export default TeamCard;
