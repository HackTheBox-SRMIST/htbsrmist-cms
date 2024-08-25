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
    Divider
} from "@chakra-ui/react";
import Image from "next/image";

const TeamCard = ({ team }) => {
    const socials = team.socials;

    return (
        <Card maxW="sm">
            <CardBody>
                <Image
                    src={team.pictureUrl}
                    alt={team.name}
                    borderRadius="lg"
                    width={300}
                    height={200}
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
                <ButtonGroup spacing="2">
                    {Object.entries(socials).map(([platform, url], index) => (
                        <Button
                            key={index}
                            as="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="solid"
                            colorScheme="blue"
                        >
                            {platform.charAt(0).toUpperCase() +
                                platform.slice(1)}
                        </Button>
                    ))}
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
};

export default TeamCard;
