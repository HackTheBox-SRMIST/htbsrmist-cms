import React, { useState } from "react";
import {
    ButtonGroup,
    Button,
    Tooltip,
    useToast,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay
} from "@chakra-ui/react";
import Badge from "@/components/shared/Badge";
import { FaGithub, FaLink, FaLinkedin, FaTwitter } from "react-icons/fa";
import axios from "axios";
import EditMember from "@/components/Teams/EditMember";

const socialIcons = {
    github: <FaGithub />,
    linkedin: <FaLinkedin />,
    twitter: <FaTwitter />,
    website: <FaLink />
};

const TeamCard = ({ team, onDelete, onEdit }) => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose
    } = useDisclosure();
    const cancelRef = React.useRef();

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
            onDeleteClose();
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
            <div className="bg-light-background-dark dark:bg-dark-background-light dark:text-dark-color text-light-color flex flex-col items-center py-8 mx-2 mt-3 transition duration-300 px-0 w-auto rounded-3xl relative group">
                <div className="pb-3 text-center">
                    <Badge
                        status={`Current : ${team.isCurrent ? "Yes" : "No"}`}
                        variant={team.isCurrent ? "success" : "error"}
                    />
                </div>
                <img
                    src={team.pictureUrl}
                    alt={team.name}
                    className="rounded-full border-2 border-solid dark:border-light-accent/50 border-light-color/50 p-1 w-36 h-36 bg-cover bg-center object-cover brightness-125 transition duration-300 dark:group-hover:shadow-[0_0_2px_#8bef00,inset_0_0_2px_#8bef00,0_0_5px_#8bef00,0_0_15px_#8bef00]"
                />
                <span className="text-2xl pt-5 dark:text-dark-accent text-light-color font-semibold text-center">
                    {team.name}{" "}
                </span>
                <span className="text-lg dark:text-dark-accent text-light-color font-mono text-center">
                    {team.domain}
                </span>
                <span className="text-lg pt-1 dark:text-dark-color text-light-color font-normal text-center">
                    {(Array.isArray(team.status) && team.status.length > 0
                        ? team.status.reduce(
                              (acc, s) =>
                                  !acc || (s?.joined ?? 0) > (acc?.joined ?? 0)
                                      ? s
                                      : acc,
                              null
                          )?.position
                        : team.position) || ""}
                </span>
                <span className="text-md text-center break-words w-64 dark:text-dark-color text-light-color">
                    {team.caption}
                </span>
                <div className="flex-col gap-2">
                    <div className="flex gap-3 justify-center">
                        {Object.entries(socials).map(
                            ([platform, url], index) => (
                                <div key={index}>
                                    <Tooltip
                                        label={url}
                                        placement="top"
                                        hasArrow
                                    >
                                        <a
                                            href={url}
                                            className="hover:bg-htb-green hover:text-black ease-linear duration-150 rounded-full p-1 text-2xl"
                                        >
                                            {socialIcons[platform]}
                                        </a>
                                    </Tooltip>
                                </div>
                            )
                        )}
                    </div>
                    <ButtonGroup spacing="2">
                        <Button colorScheme="blue" onClick={onOpen}>
                            Edit
                        </Button>
                        <Button colorScheme="red" onClick={onDeleteOpen}>
                            Delete
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent className="bg-light-background-dark dark:bg-dark-background-light">
                        <AlertDialogHeader className="dark:text-dark-accent text-light-color font-semibold">
                            Delete Team Member
                        </AlertDialogHeader>

                        <AlertDialogBody className="dark:text-light-color text-light-color">
                            Are you sure you want to delete {team.name}? This
                            action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={onDeleteClose}
                                className="bg-light-background dark:bg-dark-background text-light-color dark:text-dark-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDelete}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

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
