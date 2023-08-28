import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatArea } from "../../components/ChatArea";
// import ChatArea from "../../components/ChatArea/ChatArea";
import Sidebar from "../../components/Sidebar/Sidebar";
import axios from "axios";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// export interface Message {
//   title: string
//   role: 'user' | 'assistant'
//   content: string
// }
const defaultMessage = {
  title: "",
  role: "user",
  content: "",
};

const App = () => {
  const [currentTitle, setCurrentTitle] = useState("");
  const [previousMessages, setPreviousMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [message, setMessage] = useState(defaultMessage);

  const [fileList, setFileList] = useState([
    "tsla_earnings_transcript_q4_2022",
  ]);

  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const [messages, setMessages] = useState("");

  const getMessage = async () => {
    axios
      .get("http://localhost:8000/api/chat")
      .then((response) => {
        const data = response.data;
        setMessages(data);
      })
      .catch(function (err) {});
  };

  useEffect(() => {
    getMessage();
  }, [isLoadingMessage]);

  const sendMessage = async () => {
    setIsLoadingMessage(true);
    const csrftoken = document.cookie.split("csrftoken=")[1];
    try {
      const response = await axios({
        url: "http://localhost:8000/api/chat",
        method: "POST",
        data: {
          message: messageContent,
        },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // This is important
      });

      if (response.status === 201) {
        setIsLoadingMessage(false);
        // do something
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // We're initiating a new chat
    if (!currentTitle && messageContent && message) {
      setCurrentTitle(messageContent);
    }

    // We're in an existing chat
    if (currentTitle && messageContent && message) {
      setPreviousMessages((prev) => [
        ...prev,
        {
          title: currentTitle,
          role: "user",
          message: messageContent,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
  }, [message, currentTitle]);

  const selectExistingChat = (title) => {
    setCurrentTitle(title);
    setMessage(defaultMessage);
    setMessageContent("");
  };

  return (
    <Flex width="full" height="full">
      <Sidebar
        handleSelectExistingChat={selectExistingChat}
        previousMessages={previousMessages}
        fileList={fileList}
      />

      <ChatArea
        previousMessages={messages}
        currentTitle={currentTitle}
        messageContent={messageContent}
        setMessageContent={setMessageContent}
        handleSendMessage={sendMessage}
        isLoadingMessage={isLoadingMessage}
      />
    </Flex>
  );
};

export default App;
