import { Button, Flex, Icon, Text, DarkMode } from "@chakra-ui/react";
import React from "react";
import { FiUser } from "react-icons/fi";

const SidebarFooter = () => {
  return (
    <DarkMode>
      <Flex direction="column" align="flex-start" width="full">
        <Button
          variant="ghost"
          w="full"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={3}
          borderRadius="6px"
          _hover={{ bg: "#2A2B32" }}
          fontWeight={400}
          fontSize="14px"
        >
          <Flex>
            <Icon textColor="white" as={FiUser} mr={3} />
            <Text textColor="white">AIAP Group One</Text>
          </Flex>
        </Button>
      </Flex>
    </DarkMode>
  );
};
export default SidebarFooter;
