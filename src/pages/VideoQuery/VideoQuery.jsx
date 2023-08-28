import {
  Box,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Center,
  VStack,
  Card,
  CardBody,
  InputRightElement,
  AspectRatio,
  Icon,
  Image,
  Spinner,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { useFileUpload } from "use-file-upload";
import { AiOutlinePlus } from "react-icons/ai";
import { MdCheckCircle } from "react-icons/md";
import YouTube from "react-youtube";
import Highlighter from "react-highlight-words";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { FiSearch, FiUser, FiBookOpen, FiHeart, FiSend } from "react-icons/fi";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const VideoQuery = () => {
  const [urlContent, setUrlContent] = useState("");
  const [isLoadingSendingVideoAttributes, setIsLoadingSendingVideoAttributes] =
    useState(false);
  const [videoAttribute, setVideoAttribute] = useState();

  const [finalUrlContent, setFinalUrlContent] = useState("");
  const [urlImage, setUrlImage] = useState();
  const [videoTitle, setVideoTitle] = useState();
  const [videoAuthorName, setVideoAuthorName] = useState();
  const [videoId, setVideoId] = useState();
  const [showVideo, setShowVideo] = useState(false);
  const [showVideoTranscript, setShowVideoTranscript] = useState();

  const [messageContent, setMessageContent] = useState();
  const [isLoadingUserQuery, setIsLoadingUserQuery] = useState();
  const [llmResponse, setLlmResponse] = useState();
  const [llmSources, setLlmSources] = useState();
  const [sourceTimestamp, setSourceTimestamp] = useState([]);

  const [isRetrievingTranscript, setIsRetrievingTranscript] = useState(false);

  const [retrieveQuestions, setRetrieveQuestions] = useState();
  const [isRetrievingQuestions, setIsRetrievingQuestions] = useState(false);

  const [showVideoStartTimeRow, setShowVideoStartTimeRow] = useState();
  const [showVideoEndTimeRow, setShowVideoEndTimeRow] = useState();
  const [showVideoTranscriptRow, setShowVideoTranscriptRow] = useState();

  const sendVideoAttributes = async () => {
    setIsLoadingSendingVideoAttributes(true);
    const csrftoken = document.cookie.split("csrftoken=")[1];
    try {
      const response = await axios({
        url: "http://localhost:8000/api/watchhistory",
        method: "POST",
        data: {
          videoUrl: urlContent,
          videoThumbnailUrl: urlImage,
          videoAuthor: videoAuthorName,
          videoName: videoTitle,
        },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // This is important
      });

      if (response) {
        setIsLoadingSendingVideoAttributes(false);
        // do something
        setShowVideoTranscript(response["data"]["message"]);
        setShowVideoStartTimeRow(
          response["data"]["message"].match(/\d+\.\d+/g).map(Number)
        );
        setShowVideoEndTimeRow(
          response["data"]["message"].match(/\s\d+\.\d+/g).map(Number)
        );
        setShowVideoTranscriptRow(
          response["data"]["message"].split(/\d+\.\d+\s\-\s\d+\.\d+\s\:\s+/g)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getVideoAttribute = async () => {
    axios
      .get("http://localhost:8000/api/watchhistory")
      .then((response) => {
        const data = response.data;
        setVideoAttribute(data);
      })
      .catch(function (err) {});
  };

  useEffect(() => {
    getVideoAttribute();
  }, [isLoadingSendingVideoAttributes]);

  const opts = {
    // height: "100%",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  const handleShowVideo = () => {
    setShowVideo(true);
    // console.log(e);
  };

  const sendVideoUrl = async (videoUrl, videoUrlId) => {
    setIsRetrievingTranscript(true);
    const csrftoken = document.cookie.split("csrftoken=")[1];
    try {
      const response = await axios({
        url: `http://localhost:8000/api/youtubeurl/${videoUrlId}`,
        method: "POST",
        data: {
          videoUrl: videoUrl,
          transcriptUrl: videoUrlId,
        },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // This is important
      });

      if ((response.status === 200) | (response.status === 201)) {
        setShowVideoTranscript(response["data"]["message"]);
        setShowVideoStartTimeRow(
          response["data"]["message"].match(/\d+\.\d+/g).map(Number)
        );
        setShowVideoEndTimeRow(
          response["data"]["message"].match(/\s\d+\.\d+/g).map(Number)
        );
        setShowVideoTranscriptRow(
          response["data"]["message"].split(/\d+\.\d+\s\-\s\d+\.\d+\s\:\s+/g)
        );
        setIsRetrievingTranscript(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendUserQuery = async (videoId) => {
    setIsLoadingUserQuery(true);
    const csrftoken = document.cookie.split("csrftoken=")[1];
    try {
      const response = await axios({
        url: `http://localhost:8000/api/youtubechat/${videoId}`,
        method: "POST",
        data: {
          query: messageContent,
          text: showVideoTranscript,
          videoUrlId: videoId,
        },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // This is important
      });

      if ((response.status === 200) | (response.status === 201)) {
        setIsLoadingUserQuery(false);
        setLlmResponse(response["data"]["answer"]);
        setLlmSources(response["data"]["sources"]);

        // for (let i = 0; i < response["data"]["sources"].length; i++) {
        //   sourceTimestamp.push({
        //     sourceId: i,
        //     // sourceTime: response["data"]["sources"][i].match(/\d+/)[0],
        //     sourceTime: response["data"]["sources"][i].match(/\d+\.\d+/g)[0],
        //     sourceText: response["data"]["sources"][i].replace(
        //       /\d+\.\d+\s\-\s\d+\.\d+\s\:\s+/g,
        //       ""
        //     ),
        //   });
        // }
        // do something
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [player, setPlayer] = useState(null);

  const onReady = (event) => {
    setPlayer(event.target);
    // event.target.playVideo();
  };

  const changeTime = (seconds) => {
    player.seekTo(seconds);
    player.playVideo();
  };

  // console.log(videoId);

  const handleGetQuestions = async (videoId) => {
    setIsRetrievingQuestions(true);
    const csrftoken = document.cookie.split("csrftoken=")[1];
    try {
      const response = await axios({
        url: `http://localhost:8000/api/generatequestions/${videoId}`,
        method: "POST",
        data: {
          transcriptUrl: videoId,
        },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // This is important
      });

      if ((response.status === 200) | (response.status === 201)) {
        setRetrieveQuestions(
          response["data"]["message"].split(/\d+\./g).slice([1])
        );
        // setShowVideoTranscript(response["data"]["message"]);
        setIsRetrievingQuestions(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [finalUserQuery, setFinalUserQuery] = useState("");

  const [retrieveExplainedLikeFive, setRetrieveExplainedLikeFive] =
    useState("");
  const [isLoadingExplainedLikeFive, setIsLoadingExplainedLikeFive] =
    useState(false);

  const handleExplainLikeImFive = async () => {
    setIsLoadingExplainedLikeFive(true);

    const csrftoken = document.cookie.split("csrftoken=")[1];
    try {
      const response = await axios({
        url: `http://localhost:8000/api/explainlikefive`,
        method: "POST",
        data: {
          userQuery: finalUserQuery,
          // llmResponse: llmResponse,
          transcriptUrl: videoId,
        },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // This is important
      });

      if ((response.status === 200) | (response.status === 201)) {
        setRetrieveExplainedLikeFive(response["data"]["message"]);
        setIsLoadingExplainedLikeFive(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // console.log(player.getCurrentTime());

  const [playerCurrentTime, setPlayerCurrentTime] = useState();

  // console.log(player.getCurrentTime());

  useEffect(() => {
    if (player !== null) {
      const interval = setInterval(async () => {
        const elapsed_sec = await player.getCurrentTime(); // this is a promise. dont forget to await

        setPlayerCurrentTime(Math.round(elapsed_sec * 100) / 100);
      }, 100); // 100 ms refresh. increase it if you don't require millisecond precision

      return () => {
        clearInterval(interval);
      };
    }
  }, [player]);

  // console.log(playerCurrentTime);
  // console.log(showVideoTranscript);
  // console.log(showVideoTranscript.match(/\d+\.\d+/g).map(Number));
  // console.log(showVideoTranscript.match(/\s\d+\.\d+/g).map(Number));

  // console.log(showVideoTranscript.split(/\d+\.\d+\s\-\s\d+\.\d+\s\:\s+/g));

  // useEffect(() => {
  //   if (player !== null) {
  //     console.log(player.getCurrentTime());
  //   }
  // }, [player]);

  const [highlightText, setHighlightText] = useState("");
  if (player !== null) {
    for (let i = 0; i < showVideoStartTimeRow.length; i++) {
      if (
        player.getCurrentTime() > showVideoStartTimeRow[i] &&
        player.getCurrentTime() < showVideoEndTimeRow[i]
      ) {
        // console.log(showVideoTranscriptRow[i]);
        setHighlightText(showVideoTranscriptRow[i]);
      }
    }
  }

  return (
    <Box h="100vh" w="100vw">
      <HStack w="100%" h="10%">
        <Box h="100%" w="20%">
          {/* <Text pl="10" pt="3" fontSize="xl">
            19:00
          </Text> */}
          <Text pl="10" pt="5" h="100%" fontSize="xl">
            Tuesday, 4 Jul
          </Text>
        </Box>
        <Box h="100%" w="70%">
          <InputGroup h="100%">
            <InputLeftElement
              h="100%"
              pointerEvents="none"
              children={<FiSearch color="gray.600" />}
            />

            <Input
              alignSelf="center"
              h="50%"
              type="text"
              placeholder="Search..."
              border="1px solid #949494"
            />
          </InputGroup>
        </Box>
        <Box h="100%" w="10%">
          <Center h="100%">
            <FiUser border="solid 1px" />
            <Text pl="3">John Doe</Text>
          </Center>
        </Box>
      </HStack>
      <HStack h="100%" w="100%">
        <Center h="100%" w="100%">
          <VStack h="100%" w="50%">
            <Box w="100%" h="100%" pr="10">
              <InputGroup w="100%" mt="2" mb="2">
                <Center w="100%">
                  <Input
                    id="youtube-url"
                    placeholder="Enter url"
                    bg="#40414f"
                    border="1px solid"
                    borderColor="rgba(32,33,35,0.50)"
                    borderRadius={10}
                    p={6}
                    value={urlContent}
                    onChange={(e) => {
                      setUrlContent(e.target.value);
                      // handleUrl(e.target.value);
                      if (e.target.value.includes("?v=")) {
                        let tempVar = e.target.value.split("?v=")[1];
                        let thumbnailUrl =
                          "https://img.youtube.com/vi/" + tempVar + "/0.jpg";
                        setUrlImage(thumbnailUrl);
                        setVideoId(tempVar);

                        fetch(
                          `https://noembed.com/embed?dataType=json&url=${e.target.value}`
                        )
                          .then((res) => res.json())
                          .then((data) => {
                            setVideoTitle(data.title);
                            setVideoAuthorName(data.author_name);
                          });
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setFinalUrlContent(urlContent);
                        // handleUrl(e);
                        sendVideoAttributes();
                        setUrlContent("");
                      }
                    }}
                  />
                  <InputRightElement
                    h="100%"
                    pr="6"
                    //   onClick={((e) => clearInput(), handleSendMessage)}
                    children={<FiSearch w="16px" h="16px" color="#8e8ea0" />}
                  />
                </Center>
              </InputGroup>

              <Text pt="3" w="100%" fontSize="xl">
                Recently Viewed
              </Text>
              <VStack
                // border="solid 1px"
                p="2"
                h="33%"
                overflowY="scroll"
                borderRadius="10"
              >
                {videoAttribute &&
                  videoAttribute.reverse().map((data) => (
                    <>
                      <HStack
                        key={data}
                        pt="2"
                        pb="2"
                        // border="solid 1px"
                        //   h="45%"
                        w="100%"
                        borderRadius="10"
                        bgColor="facebook.600"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          handleShowVideo();
                          setVideoTitle(data.videoName);
                          setVideoAuthorName(data.videoAuthor);
                          setVideoId(data.videoUrl.split("?v=")[1]);
                          sendVideoUrl(
                            data.videoUrl,
                            data.videoUrl.split("?v=")[1]
                          );
                        }}
                      >
                        <Box w="20%" pl="3">
                          <Image
                            borderRadius="10"
                            src={data.videoThumbnailUrl}
                          />
                        </Box>
                        <VStack w="80%" h="100%">
                          <Text w="100%" pl="2" fontWeight="bold">
                            {data.videoName}
                          </Text>
                          {data.videoAuthor && (
                            <Text w="100%" pl="2">
                              by {data.videoAuthor}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </>
                  ))}
              </VStack>

              <Text pt="3" w="100%" fontSize="xl">
                Chat
              </Text>
              <VStack
                mt="3"
                mb="5"
                border="solid 1px"
                h="56%"
                borderRadius="10"
                overflowY="scroll"
              >
                <Text pl="5" pt="3" w="100%">
                  Ask a question
                </Text>
                <InputGroup w="98%">
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
                          setFinalUserQuery(messageContent);
                          sendUserQuery(videoId);
                          setMessageContent("");
                          setRetrieveExplainedLikeFive("");
                          // setSourceTimestamp("");
                        }
                      }}
                    />
                    <InputRightElement
                      h="100%"
                      pr="6"
                      // onClick={((e) => clearInput(), handleSendMessage)}
                      children={<FiSend w="16px" h="16px" color="#8e8ea0" />}
                    />
                  </Center>
                </InputGroup>

                {isLoadingUserQuery && (
                  <>
                    <Text>Retrieving Response</Text>
                    <Spinner />
                  </>
                )}

                {!isLoadingUserQuery && llmResponse && (
                  <>
                    <Text
                      pl="5"
                      pt="1"
                      fontSize="md"
                      w="100%"
                      fontWeight="bold"
                    >
                      Question:
                    </Text>
                    <Text pl="5" fontSize="md" w="100%">
                      {finalUserQuery}
                    </Text>
                    <Text
                      pl="5"
                      pt="1"
                      fontSize="md"
                      w="100%"
                      fontWeight="bold"
                    >
                      Answer:
                    </Text>
                    <Text pl="5" fontSize="md" w="100%">
                      {llmResponse}
                    </Text>
                    <Button
                      w="95%"
                      p="2"
                      onClick={(e) => handleExplainLikeImFive()}
                    >
                      Explain to me like I'm five
                    </Button>
                    {isLoadingExplainedLikeFive && (
                      <>
                        <Text
                          pl="5"
                          pt="1"
                          fontSize="md"
                          // w="100%"
                          fontWeight="bold"
                        >
                          Retrieving ELI5 Response
                        </Text>
                        <Spinner />
                      </>
                    )}
                    {!isLoadingExplainedLikeFive &&
                      retrieveExplainedLikeFive && (
                        <>
                          <Text
                            pl="5"
                            pt="1"
                            fontSize="md"
                            w="100%"
                            fontWeight="bold"
                          >
                            ELI5 Answer:
                          </Text>
                          <Text
                            pl="5"
                            pt="1"
                            fontSize="md"
                            w="100%"
                            // fontWeight="bold"
                          >
                            {retrieveExplainedLikeFive}
                          </Text>
                        </>
                      )}
                    <Text
                      pl="5"
                      pt="1"
                      fontSize="md"
                      w="100%"
                      fontWeight="bold"
                    >
                      Source:
                    </Text>
                    {llmSources.map((data) => (
                      <>
                        <Text key={data} pl="5" pt="1" fontSize="md" w="100%">
                          <Button
                            onClick={(e) =>
                              changeTime(data.match(/\d+\.\d+/g)[0])
                            }
                            _hover={{ bg: "facebook.800" }}
                            textColor="facebook.300"
                            size="xs"
                          >
                            {data.match(/\d+\.\d+/g)[0]}
                          </Button>{" "}
                          : {data.replace(/\d+\.\d+\s\-\s\d+\.\d+\s\:\s+/g, "")}
                        </Text>
                      </>
                    ))}
                  </>
                )}
              </VStack>
            </Box>
          </VStack>

          <VStack
            h="112vh"
            w="45%"
            border="solid 1px"
            overflowY="scroll"
            borderRadius="10"
            alignSelf="start"
          >
            {showVideo && (
              <>
                <Text fontWeight="bold" textAlign="center" pt="2">
                  {videoTitle}
                </Text>
                <Text textAlign="center" fontSize="sm">
                  by {videoAuthorName}
                </Text>
                <AspectRatio w="80%">
                  <YouTube videoId={videoId} opts={opts} onReady={onReady} />
                </AspectRatio>
                {/* <button onClick={() => changeTime(203)}>Change Time</button> */}
              </>
            )}
            {isRetrievingTranscript && (
              <>
                <Text>Retrieving Transcript</Text>
                <Spinner />
              </>
            )}

            {!isRetrievingTranscript && (
              <>
                {showVideoTranscript && (
                  <>
                    <Accordion defaultIndex={[0]} allowMultiple w="95%">
                      <AccordionItem pt="3" pb="3">
                        <h2>
                          <AccordionButton>
                            <Box
                              as="span"
                              flex="1"
                              textAlign="left"
                              fontWeight="bold"
                            >
                              Transcript
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel
                          pb={4}
                          fontSize="sm"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {/* {showVideoTranscriptRow &&
                            showVideoTranscriptRow.map((data) => (
                              <Text
                                style={{
                                  color:
                                    data === highlightText ? "blue" : "red",
                                }}
                                w="100%"
                              >
                                {data}
                              </Text>
                           
                            ))} */}
                          {showVideoTranscript}
                        </AccordionPanel>
                      </AccordionItem>
                      <AccordionItem pt="3" pb="3">
                        <h2>
                          <AccordionButton>
                            <Box
                              as="span"
                              flex="1"
                              textAlign="left"
                              fontWeight="bold"
                            >
                              Kaki Tools
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack>
                            {/* <HStack> */}
                            {/* <Button>Take Notes</Button> */}
                            <Button
                              onClick={(e) => handleGetQuestions(videoId)}
                            >
                              Generate Questions for Study Notes
                            </Button>

                            {isRetrievingQuestions && (
                              <>
                                <Text>Generating Questions</Text>
                                <Spinner />
                              </>
                            )}

                            {!isRetrievingQuestions &&
                              retrieveQuestions &&
                              retrieveQuestions.map((data) => (
                                <List key={data} w="100%">
                                  <ListItem w="100%">
                                    <ListIcon
                                      as={MdCheckCircle}
                                      color="green.500"
                                    />{" "}
                                    {data}
                                  </ListItem>
                                </List>
                                // <Text key={data} w="100%">
                                //   {data}
                                // </Text>
                              ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                    {/* <Text w="95%" fontWeight="bold">
                      Transcript:
                    </Text> */}
                    {/* <Text
                      w="95%"
                      fontSize="sm"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {showVideoTranscript}
                    </Text> */}
                  </>
                )}
              </>
            )}
          </VStack>
        </Center>
      </HStack>
    </Box>
  );
};

export default VideoQuery;
