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
import { FaGithub, FaInstagram, FaLink, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import axios from "axios";
import EditMember from "@/components/Teams/EditMember";
import {
    isValidSocialUrl,
    formatExternalUrl,
    getTransformedImageUrl
} from "@/utils/misc/socialUrls";

const TeamCard = ({ team, onDelete, onEdit, existingYears = [] }) => {
    const toast = useToast();
    const [imgError, setImgError] = useState(false);
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

    const socials = team.socials || {};
    const rawImg = team.pictureUrl || team.image;
    const imageUrl = !imgError && rawImg ? getTransformedImageUrl(rawImg) : "";

    const hasSocials = Boolean(
        (socials.linkedin && isValidSocialUrl(socials.linkedin)) ||
        (socials.twitter && isValidSocialUrl(socials.twitter)) ||
        (socials.website && isValidSocialUrl(socials.website)) ||
        (socials.github && isValidSocialUrl(socials.github))
    );

    return (
        <>
            <div className="text-white flex flex-col items-center justify-start w-full h-full relative group transition duration-300 text-center py-1">
                {/* Green Box Container: uniform height across all members in the row */}
                <div className="w-full h-full rounded-2xl border-2 border-solid border-light-color/50 dark:border-htb-green/50 p-2 sm:p-2.5 bg-light-background-light dark:bg-black/40 flex flex-col justify-between items-center transition duration-300 group-hover:border-htb-green group-hover:shadow-[0_0_2px_#8bef00,inset_0_0_2px_#8bef00,0_0_5px_#8bef00,0_0_15px_#8bef00]">
                    {/* Top Section: Photo, Name, Domain, Caption */}
                    <div className="w-full flex flex-col items-center">
                        {/* Square Photo with Rounded Corners */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-1 sm:mb-1.5 bg-[#060a12] shrink-0 border border-black/10 dark:border-white/10 flex items-center justify-center">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={team.name || "Member"}
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => setImgError(true)}
                                    className="w-full h-full object-cover object-center brightness-105 group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-mono font-bold text-htb-green/50">
                                    {team.name ? team.name[0].toUpperCase() : "?"}
                                </div>
                            )}
                        </div>

                        {/* Member Name */}
                        <div className="min-h-[1.85rem] sm:min-h-[2.2rem] flex items-center justify-center w-full px-1">
                            <span className="text-[15px] min-[380px]:text-base sm:text-[17px] md:text-[18px] text-htb-green font-bold text-center leading-tight break-words line-clamp-2">
                                {team.name}
                            </span>
                        </div>

                        {/* Domain Badge */}
                        <div className="min-h-[1.4rem] sm:min-h-[1.5rem] flex items-center justify-center w-full mt-0.5">
                            {team.domain && (
                                <span className="inline-block text-xs sm:text-[13.5px] font-mono font-bold uppercase tracking-wider text-htb-green bg-htb-green/10 border border-htb-green/30 px-2 sm:px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(159,239,0,0.2)] truncate max-w-[95%]">
                                    {team.domain}
                                </span>
                            )}
                        </div>

                        {/* Caption */}
                        <div className="min-h-[2.5rem] sm:min-h-[2.8rem] flex items-center justify-center w-full mt-0.5 sm:mt-1 px-1">
                            {team.caption ? (
                                <span className="text-center text-[11px] sm:text-xs font-semibold text-light-color dark:text-zinc-200 break-words leading-tight italic line-clamp-3">
                                    &ldquo;{team.caption}&rdquo;
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Social footer strip */}
                    <div className="w-full flex pt-1 sm:pt-1.5 gap-1.5 sm:gap-2 justify-center items-center min-h-[2rem] border-t border-black/10 dark:border-white/5 mt-1">
                        {hasSocials ? (
                            <>
                                {socials.linkedin && isValidSocialUrl(socials.linkedin) && (
                                    <Tooltip label={socials.linkedin} placement="top" hasArrow>
                                        <a
                                            href={formatExternalUrl(socials.linkedin)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:bg-htb-green hover:text-black ease-linear duration-150 rounded-full p-1 text-lg sm:text-xl transition-all hover:scale-110 flex items-center justify-center shrink-0"
                                        >
                                            <FaLinkedin />
                                        </a>
                                    </Tooltip>
                                )}
                                {socials.twitter && isValidSocialUrl(socials.twitter) && (
                                    <Tooltip label={socials.twitter} placement="top" hasArrow>
                                        <a
                                            href={formatExternalUrl(socials.twitter)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:bg-htb-green hover:text-black ease-linear duration-150 rounded-full p-1 text-lg sm:text-xl transition-all hover:scale-110 flex items-center justify-center shrink-0"
                                        >
                                            <FaXTwitter />
                                        </a>
                                    </Tooltip>
                                )}
                                {socials.website && isValidSocialUrl(socials.website) && (
                                    <Tooltip label={socials.website} placement="top" hasArrow>
                                        <a
                                            href={formatExternalUrl(socials.website)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:bg-htb-green hover:text-black ease-linear duration-150 rounded-full p-1 text-lg sm:text-xl transition-all hover:scale-110 flex items-center justify-center shrink-0"
                                        >
                                            {socials.website.toLowerCase().includes("instagram.com") ? (
                                                <FaInstagram />
                                            ) : (
                                                <FaLink />
                                            )}
                                        </a>
                                    </Tooltip>
                                )}
                                {socials.github && isValidSocialUrl(socials.github) && (
                                    <Tooltip label={socials.github} placement="top" hasArrow>
                                        <a
                                            href={formatExternalUrl(socials.github)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:bg-htb-green hover:text-black ease-linear duration-150 rounded-full p-1 text-lg sm:text-xl transition-all hover:scale-110 flex items-center justify-center shrink-0"
                                        >
                                            <FaGithub />
                                        </a>
                                    </Tooltip>
                                )}
                            </>
                        ) : (
                            <div className="h-6" />
                        )}
                    </div>

                    {/* Admin controls: Current badge + Edit/Delete buttons */}
                    <div className="w-full flex items-center justify-between pt-1.5 sm:pt-2 px-1 border-t border-black/10 dark:border-white/5 mt-1 gap-1">
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold ${
                                team.isCurrent
                                    ? "dark:bg-dark-success-background bg-light-success-background dark:text-dark-success-color text-light-success-color"
                                    : "dark:bg-dark-warn-background bg-light-error-background dark:text-dark-error-color text-light-error-color"
                            }`}
                        >
                            {team.isCurrent ? "Current" : "Past"}
                        </span>
                        <ButtonGroup size="xs" spacing="1">
                            <Button size="xs" colorScheme="blue" onClick={onOpen}>
                                Edit
                            </Button>
                            <Button size="xs" colorScheme="red" onClick={onDeleteOpen}>
                                Delete
                            </Button>
                        </ButtonGroup>
                    </div>
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
                existingYears={existingYears}
            />
        </>
    );
};

export default TeamCard;
