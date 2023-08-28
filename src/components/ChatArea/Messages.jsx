import { Box, Flex, Text, Center, HStack, Avatar } from "@chakra-ui/react";
import { AiOutlineFileSearch } from "react-icons/ai";
import React from "react";

const Messages = ({ currentTitle, previousMessages, userMessage }) => {
  const [history, setHistory] = React.useState([]);

  const YAML = require("js-yaml");

  if (
    userMessage !== "" &&
    !history.includes("Question: " + userMessage) &&
    history.length === 0
  ) {
    history.push("Question: " + userMessage);
  } else if (
    userMessage !== "" &&
    !history.includes("Question: " + userMessage) &&
    history.length !== 0
  ) {
    history.unshift("Question: " + userMessage);
  }

  for (let i = 0; i < previousMessages.length; i++) {
    const previousMessage = previousMessages[i].message;
    const doc = YAML.load(previousMessage);

    if (!history.includes("Question: " + doc.query) && history.length === 0) {
      history.push("Question: " + doc.query);
    } else if (
      !history.includes("Question: " + doc.query) &&
      history.length !== 0
    ) {
      history.unshift("Question: " + doc.query);
    }
    if (!history.includes("Answer: " + doc.answer))
      history.unshift("Answer: " + doc.answer);
  }

  return (
    <Flex direction="column-reverse" h="full" w="full" overflowY="scroll">
      {history.map((message) => (
        <>
          {message.includes("Answer: ") && (
            <Box key={message} pl="3" pr="3" pt="5" pb="5" bgColor="#434654">
              <Center>
                <HStack w="60%" alignItems="left">
                  <Avatar
                    alignSelf="center"
                    w="8"
                    h="8"
                    borderRadius={3}
                    fontSize="xx-small"
                    bgColor="#479479"
                    icon={<AiOutlineFileSearch fontSize="1.5rem" />}
                  />
                  {/* <Typing> */}
                  <Text pl="3">{message.replace("Answer: ", "")}</Text>
                  {/* </Typing> */}
                </HStack>
              </Center>
            </Box>
          )}
          {message.includes("Question: ") && (
            <Box key={message} pl="3" pr="3" pt="5" pb="5">
              <Center>
                <HStack w="60%" alignItems="left">
                  <Avatar
                    borderRadius={3}
                    w="8"
                    h="8"
                    fontSize="small"
                    name="Group 1"
                    bgColor="#818b93"
                  />
                  <Text pl="3">{message.replace("Question: ", "")}</Text>
                </HStack>
              </Center>
            </Box>
          )}
        </>
      ))}
    </Flex>
  );
};
export default Messages;
