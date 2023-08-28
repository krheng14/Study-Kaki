import React from "react";

import {
  Box,
  Flex,
  VStack,
  Text,
  HStack,
  useColorModeValue,
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Link,
  Button,
  LightMode,
  IconButton,
} from "@chakra-ui/react";

import { FiUser } from "react-icons/fi";
import { Link as ReachLink } from "react-router-dom";
import useWindowDimensions from "../hook/useWindowDimensions";
import { useMediaQuery } from "react-responsive";

const HomeNavbar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { height, width } = useWindowDimensions();

  const isIphoneVert = useMediaQuery({
    maxWidth: 567,
    minWidth: 319,
  });

  const MobileNav = ({ onOpen, ...rest }) => {
    return (
      <>
        {isIphoneVert && (
          <Flex
            pl="1rem"
            pr="1rem"
            height="8vh"
            alignItems="center"
            justifyContent={{ base: "space-between", md: "flex-end" }}
            fontFamily="Noto Sans"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100vw",
              zIndex: "1",
            }}
          >
            <IconButton
              variant="outline"
              colorScheme="teal"
              aria-label="Send email"
              icon={<FiUser />}
            />
          </Flex>
        )}

        {!isIphoneVert && (
          <Flex
            pl="3rem"
            pr="3rem"
            height="10vh"
            alignItems="center"
            justifyContent={{ base: "space-between", md: "flex-end" }}
            fontFamily="Noto Sans"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100vw",
              zIndex: "1",
            }}
          >
            <IconButton
              variant="outline"
              colorScheme="teal"
              aria-label="Send email"
              icon={<FiUser />}
            />
          </Flex>
        )}
      </>
    );
  };

  return (
    <LightMode>
      <Box
        minH="100vh"
        minW="100vw"
        bg={useColorModeValue("#f1eef1", "#212529")}
      >
        <MobileNav onOpen={onOpen} />
        <Box>{children}</Box>
      </Box>
    </LightMode>
  );
};

export default HomeNavbar;
