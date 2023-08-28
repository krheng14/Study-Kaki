import {
  Button,
  Flex,
  Icon,
  Text,
  List,
  ListItem,
  ListIcon,
  Link,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiMessageSquare } from "react-icons/fi";
import SidebarFooter from "./SidebarFooter";
import { useFileUpload } from "use-file-upload";

const Sidebar = ({ previousMessages, fileList, handleSelectExistingChat }) => {
  const chatTitles = Array.from(
    new Set(previousMessages.map((prev) => prev.title))
  );

  const [files, selectFiles] = useFileUpload();

  const [documentSelected, setDocumentSelected] = React.useState();

  return (
    <Flex
      direction="column"
      shrink={0}
      bg="gray.900"
      width="260px"
      display={{ base: "none", md: "flex" }}
    >
      <Flex direction="column" height="100vh" minHeight={0}>
        <Flex
          direction="column"
          alignItems="flex-start"
          height="100vh"
          width="full"
        >
          <Flex
            direction="column"
            justify="space-between"
            height="100vh"
            flexGrow={1}
            p={2}
            width="full"
          >
            <Flex direction="column">
              <Button
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                bg="gray.900"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.20)"
                cursor="pointer"
                borderRadius={6}
                p={3}
                color="white"
                fontWeight={400}
                fontSize={14}
                lineHeight={20}
                _hover={{ bg: "hsla(240,9%,59%,.1)" }}
                transition="all 0.2s ease-in-out"
                // onClick={handleCreateNewDocument}
                onClick={() =>
                  selectFiles(
                    { accept: "text/*" },
                    ({ name, size, source, file }) => {
                      fileList.push(name);
                    }
                  )
                }
              >
                <Icon as={AiOutlinePlus} mr={3} />
                <Text fontSize="0.875rem">New document</Text>
              </Button>

              <List mt={3} spacing={3}>
                {fileList?.map((title) => (
                  <ListItem
                    key={title}
                    display="flex"
                    alignItems="center"
                    p={3}
                    borderRadius="6px"
                    _hover={{ bg: "#2A2B32", pr: 4 }}
                    cursor="pointer"
                    wordBreak="break-all"
                  >
                    <ListIcon as={FiMessageSquare} w={4} h={4} mr={3} />
                    <Link
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      flexGrow={1}
                      href={`#/${title}`}
                      onClick={(e) => {
                        setDocumentSelected({ title });
                      }}
                    >
                      {title}
                    </Link>
                  </ListItem>
                ))}
              </List>

              {/* <ChatsHistory
                handleSelectExistingChat={handleSelectExistingChat}
                titles={chatTitles}
              /> */}
            </Flex>

            <SidebarFooter />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Sidebar;
