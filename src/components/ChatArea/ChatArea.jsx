import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  VStack,
  Center,
} from "@chakra-ui/react";
import React from "react";
import { FiSend } from "react-icons/fi";
import Messages from "./Messages";

const ChatArea = ({
  currentTitle,
  messageContent,
  setMessageContent,
  handleSendMessage,
  previousMessages,
}) => {
  function clearInput() {
    var getValue = document.getElementById("chatbox");
    if (getValue.value !== "") {
      getValue.value = "";
    }
  }

  const [userMessage, setUserMessage] = React.useState("");

  return (
    <Flex direction="column" w="full" h="100vh">
      <Messages
        currentTitle={currentTitle}
        previousMessages={previousMessages}
        userMessage={userMessage}
      />

      <VStack>
        <InputGroup w="60%" mt="8">
          <Center w="100%">
            <Input
              id="chatbox"
              placeholder="Send a message"
              bg="#40414f"
              border="1px solid"
              borderColor="rgba(32,33,35,0.50)"
              borderRadius={10}
              p={6}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                  setUserMessage(messageContent);
                  setMessageContent("");
                }
              }}
            />
            <InputRightElement
              h="100%"
              pr="6"
              onClick={((e) => clearInput(), handleSendMessage)}
              children={<FiSend w="16px" h="16px" color="#8e8ea0" />}
            />
          </Center>
        </InputGroup>
      </VStack>
      <Box px="16px" pt="24px" mb="3">
        <Text color="rgba(255,255,255,.5)" fontSize="12px" textAlign="center">
          <Link textDecoration="underline" _hover={{ textDecoration: "none" }}>
            DocQueryGPT Jun 23 Version
          </Link>
          . Free Research Preview. DocQueryGPT may produce inaccurate
          information about people, places, or facts.
        </Text>
      </Box>
    </Flex>
  );
};
export default ChatArea;
