import { Box, Text, Center, VStack } from "@chakra-ui/react";
import { HomeNavbar } from "../../components";

import useWindowDimensions from "../../hook/useWindowDimensions";
import { useMediaQuery } from "react-responsive";

const Home = () => {
  const { height, width } = useWindowDimensions();

  const isIphoneVert = useMediaQuery({
    maxWidth: 567,
    minWidth: 319,
  });

  return (
    <>
      {!isIphoneVert && (
        <Box>
          <HomeNavbar>
            <Center h="100vh" border="solid 1px">
              <VStack>
                <Text>Title</Text>
                <Box border="solid 1px" w="75vw" h="75vh">
                  <Center h="100%">Add gif here</Center>
                </Box>
                <Text>Add description here</Text>
              </VStack>
            </Center>
          </HomeNavbar>
        </Box>
      )}
    </>
  );
};

export default Home;
