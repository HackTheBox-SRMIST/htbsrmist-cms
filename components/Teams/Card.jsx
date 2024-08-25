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
    Tooltip
} from "@chakra-ui/react";
import Image from "next/image";

const TeamCard = ({ team }) => {
    const socials = team.socials;

    return (
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
            <CardFooter>
                <ul>
                    {Object.entries(socials).map(([platform, url], index) => (
                        <li key={index}>
                            <Tooltip label={url} placement="top" hasArrow>
                                <Button size="sm" variant="outline">
                                    {platform.charAt(0).toUpperCase() +
                                        platform.slice(1)}
                                </Button>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            </CardFooter>
        </Card>
    );
};

export default TeamCard;
