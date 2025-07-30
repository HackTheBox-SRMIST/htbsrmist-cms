import withAuth from "@/components/withAuth";
import axios from "axios";
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Button,
    ButtonGroup
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const VipCodesPage = () => {
    const [codes, setCodes] = useState([]);

    const fetchCodes = async () => {
        try {
            const response = await axios.get("/api/v1/codes/get");
            setCodes(response.data.data);
            console.log(codes);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchCodes();
    }, []);
    return (
        <div className="bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color">
            {/* <h1>
                TODO: Host a local database since bro, you need to add in a new
                model
            </h1>
            <code>
                So to summarize:
                <br />
                1. Implement an /api/v1/codes/get_codes endpoint, which is auth
                protected, fetching database entries from the VipCodes schema.
                <br />
                2. Add whatever UI and nonsens to this page
            </code> */}
            <TableContainer>
                <Table variant="simple">
                    <TableCaption> Vip+ Codes</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Index</Th>
                            <Th>Code</Th>
                            <Th>Valid</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {codes.map(function (codeobj) {
                            // console.log(codeobj);
                            return (
                                <Tr>
                                    <Td>{codeobj.index}</Td>
                                    <Td>{codeobj.code}</Td>
                                    <Td>{String(codeobj.isValid)}</Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default withAuth(VipCodesPage);
