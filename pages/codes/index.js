import withAuth from "@/components/withAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Button
} from "@chakra-ui/react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    PopoverArrow
} from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { Stack } from "@chakra-ui/react";
import { Slide } from "@chakra-ui/react";

const AlertComponent = ({ status, message }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Slide
            direction="right"
            in={isVisible}
            unmountOnExit
            style={{ zIndex: 10 }}
        >
            <Alert
                status={status}
                variant={"left-accent"}
                className="text-white"
            >
                <AlertIcon />
                {message}
            </Alert>
        </Slide>
    );
};

const VipCodesPage = () => {
    const [codes, setCodes] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [refetch, setRefetch] = useState(false); // refetch data

    const addButtonHandler = async () => {
        const user_input = document.querySelector("#add-code").value;

        if (codes.length === 0) {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                <AlertComponent
                    key="no-codes-alert"
                    status="warning"
                    message="No Codes are added yet"
                />
            ]);
            try {
                await axios.post("/api/v1/codes/create", {
                    index: 0,
                    code: user_input,
                    isValid: true
                });
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="add-success-alert"
                        status="success"
                        message="Code added successfully"
                    />
                ]);
                document.querySelector("#add-code").value = "";
                setRefetch(true);
            } catch (err) {
                console.error(err);
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="add-failure-alert"
                        status="error"
                        message="An error occurred"
                    />
                ]);
            }
        } else if (user_input === "") {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                <AlertComponent
                    key="empty-input-alert"
                    status="info"
                    message="User Input is empty"
                />
            ]);
        } else {
            let maxIndex = codes[0].index;
            for (let i = 0; i < codes.length; i++) {
                if (codes[i].index > maxIndex) {
                    maxIndex = codes[i].index;
                }
            }
            try {
                await axios.post("/api/v1/codes/create", {
                    index: maxIndex + 1,
                    code: user_input,
                    isValid: true
                });
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="add-success-alert"
                        status="success"
                        message="Code added successfully"
                    />
                ]);
                document.querySelector("#add-code").value = "";
                setRefetch(true);
            } catch (err) {
                console.error(err);
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="add-failure-alert"
                        status="error"
                        message="An error occurred"
                    />
                ]);
            }
        }
    };

    const updateButtonHandler = async () => {
        const user_input = document.querySelector("#add-code").value;

        if (codes.length === 0) {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                <AlertComponent
                    key="no-codes-alert"
                    status="warning"
                    message="No Codes are retrieved yet"
                />
            ]);
        } else if (user_input === "") {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                <AlertComponent
                    key="empty-input-alert"
                    status="info"
                    message="User Input is empty"
                />
            ]);
        } else {
            let desired_obj = null;
            for (let i = 0; i < codes.length; i++) {
                if (codes[i].code === user_input) {
                    desired_obj = codes[i];
                }
            }
            // console.log(desired_obj);
            try {
                await axios.post("/api/v1/codes/update", {
                    code: user_input,
                    isValid: !desired_obj.isValid
                });
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="update-success-alert"
                        status="success"
                        message="Code updated successfully"
                    />
                ]);
                document.querySelector("#add-code").value = "";
                setRefetch(true);
            } catch (err) {
                console.error(err);
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="update-failure-alert"
                        status="error"
                        message="An error occurred"
                    />
                ]);
            }
        }
    };

    const deleteButtonHandler = async () => {
        const user_input = document.querySelector("#add-code").value;

        if (codes.length === 0) {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                <AlertComponent
                    key="no-codes-alert"
                    status="warning"
                    message="No Codes are retrieved yet"
                />
            ]);
        } else if (user_input === "") {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                <AlertComponent
                    key="empty-input-alert"
                    status="info"
                    message="User Input is empty"
                />
            ]);
        } else {
            let desired_obj = null;
            for (let i = 0; i < codes.length; i++) {
                if (codes[i].code === user_input) {
                    desired_obj = codes[i];
                }
            }
            // console.log(desired_obj);
            try {
                await axios.post("/api/v1/codes/delete", {
                    code: desired_obj.code
                });
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="update-success-alert"
                        status="success"
                        message="Code deleted successfully"
                    />
                ]);
                document.querySelector("#add-code").value = "";
                setRefetch(true);
            } catch (err) {
                console.error(err);
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    <AlertComponent
                        key="update-failure-alert"
                        status="error"
                        message="An error occurred"
                    />
                ]);
            }
        }
    };

    const fetchCodes = async () => {
        try {
            const response = await axios.get("/api/v1/codes/get");
            setCodes(response.data.data);
            setRefetch(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch codes only when refetch is true
    useEffect(() => {
        if (refetch) {
            fetchCodes();
        }
    }, [refetch]);

    useEffect(() => {
        fetchCodes();
    }, []);

    return (
        <div className="code-manager bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color">
            <Stack
                id="error-stack"
                spacing={3}
                className="absolute top-0 right-0 w-56"
            >
                {alerts.map((alert, idx) => (
                    <div key={idx} style={{ marginBottom: "10px" }}>
                        {alert}
                    </div>
                ))}
            </Stack>

            <TableContainer>
                <Table variant="simple">
                    <TableCaption>Vip+ Codes</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Index</Th>
                            <Th>Code</Th>
                            <Th>Valid</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {codes.map((codeobj) => (
                            <Tr key={codeobj.index}>
                                <Td>{codeobj.index}</Td>
                                <Td>{codeobj.code}</Td>
                                <Td>{String(codeobj.isValid)}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            <div className="add-codes">
                <Popover placement="right">
                    <PopoverTrigger>
                        <Button colorScheme={"teal"}>Manage VIP+ Codes</Button>
                    </PopoverTrigger>
                    <PopoverContent color={"white"} bg={"gray.800"}>
                        <PopoverHeader>Manage VIP+ Codes </PopoverHeader>
                        <PopoverCloseButton />
                        <PopoverArrow bg={"gray.800"} />
                        <PopoverBody>
                            <Input
                                type="text"
                                id="add-code"
                                placeholder="Enter VIP+ Code here"
                            />
                            <br />
                            <br />
                            <Button
                                size="sm"
                                variant={"solid"}
                                colorScheme={"green"}
                                id="add-code-btn"
                                onClick={addButtonHandler}
                            >
                                Add Code
                            </Button>
                            &nbsp;&nbsp;
                            <Button
                                size="sm"
                                variant={"solid"}
                                colorScheme={"yellow"}
                                id="update-code-btn"
                                onClick={updateButtonHandler}
                            >
                                Update Code
                            </Button>
                            &nbsp;&nbsp;
                            <Button
                                size="sm"
                                variant={"solid"}
                                colorScheme={"red"}
                                id="delete-code-btn"
                                onClick={deleteButtonHandler}
                            >
                                Delete Code
                            </Button>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default withAuth(VipCodesPage);
