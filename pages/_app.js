import "@/styles/globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ChakraProvider } from "@chakra-ui/react";

export default function App({ Component, pageProps }) {
    return (
        <>
            <ChakraProvider>
                <Navbar />
                <Component {...pageProps} />
                <Footer />
            </ChakraProvider>
        </>
    );
}
