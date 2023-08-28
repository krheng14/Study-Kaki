from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser
from rest_framework import status

from docqueryapi.models import Message, WatchHistory, Transcript
from docqueryapi.serializers import (
    MessageSerializer,
    WatchHistorySerializer,
    TranscriptSerializer,
)

from rest_framework.decorators import api_view

import os
import re
import pickle

from dotenv import load_dotenv
from langchain import FAISS, OpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains.qa_with_sources import load_qa_with_sources_chain

from pytube import YouTube
import stable_whisper

from typing import List, Optional

from langchain.docstore.document import Document
from langchain.document_loaders.base import BaseLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import LLMChain

# # Create the data folder if it doesn't exist
# if not os.path.exists(data_path):
#     os.makedirs(data_path)

# yt = YouTube(url)
# stream = yt.streams.get_by_itag(251)
# download = stream.download(output_path=data_path)

# model_type = "tiny"
# data_path = '/Users/kimrui/aiap-projects/Speech-to-Text/data'
# url = 'https://www.youtube.com/watch?v=reUZRyXxUs4' <user input url>

# model = stable_whisper.load_model(model_type)
# result = model.transcribe(download, regroup=False)

# Load environment variables from a .env file
cwd = os.getcwd()
dotenv_filepath = os.path.join(cwd, "./.env")
load_dotenv(dotenv_filepath)

# Create a connection string that includes your Azure SQL Server details,
# such as the server name, database name, username, and password.
OPEN_AI_API_KEY = os.environ.get("OPENAI_API_KEY")


class EmbeddingsService:
    CURRENT_DIRECTORY = "."
    FILE_PATH_ASSETS = "./assets"
    EMBEDDINGS_PATH = FILE_PATH_ASSETS + "/embeddings"

    def get_embedded_file_path(document_name):
        return (
            EmbeddingsService.EMBEDDINGS_PATH + "/" + document_name + ".embedding.pkl"
        )

    def get_raw_file_path(document_name):
        return EmbeddingsService.FILE_PATH_ASSETS + "/raw/" + document_name

    @staticmethod
    def create_embeddings(file_name):
        if file_name == "ALL":
            # iterate over all files in app/assets/raw, and create embeddings for each
            for file in os.listdir(EmbeddingsService.FILE_PATH_ASSETS + "/raw"):
                EmbeddingsService.create_embeddings_for_file(file)

    @staticmethod
    def create_embeddings_for_file(file_name):
        # check if embedding file already exists.  It would exist in the folder app/assets/embeddings with filename +
        # .embedding.pkl.  If it exists, then skip it.  If it does not exist, then create it.
        embedded_file_path = EmbeddingsService.get_embedded_file_path(file_name)
        if os.path.exists(embedded_file_path):
            print("Embeddings file already exists.  Skipping..." + embedded_file_path)
            return
        else:
            raw_file_path = EmbeddingsService.get_raw_file_path(file_name)
            print(
                "Creating embeddings for file: "
                + raw_file_path
                + " and saving to: "
                + embedded_file_path
            )
            EmbeddingsService.create_embeddings_and_save(
                raw_file_path, embedded_file_path
            )
            print("Embeddings created successfully for: " + embedded_file_path)
            return

    @staticmethod
    def create_embeddings_and_save(raw_file_path, embedded_file_path):
        print("Creating embeddings...")
        with open(raw_file_path) as f:
            file_to_split = f.read()
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        texts = text_splitter.split_text(file_to_split)
        embeddings = OpenAIEmbeddings()

        # Vector store.  Object which stores the embeddings and allows for fast retrieval.
        docsearch = FAISS.from_texts(
            texts, embeddings, metadatas=[{"source": i} for i in range(len(texts))]
        )

        v = [docsearch, texts]

        # save to pickle
        with open(embedded_file_path, "wb") as f:
            pickle.dump(v, f)

    @staticmethod
    def load_embeddings(document_name):
        embedded_file_path = EmbeddingsService.get_embedded_file_path(document_name)
        if os.path.exists(embedded_file_path):
            print("Loading embeddings from file...")
            with open(embedded_file_path, "rb") as f:
                docsearch, texts = pickle.load(f)
        else:
            raise Exception(
                "Embeddings file does not exist.  Please create embeddings file first."
            )
        return {"docsearch": docsearch, "texts": texts}


# class AnswerRetriever:
#     def get_answer(self, embeddings, query):
#         texts = embeddings["texts"]
#         docsearch = embeddings["docsearch"]
#         docs = docsearch.similarity_search(query)
#         chain = load_qa_with_sources_chain(OpenAI(temperature=0), chain_type="stuff")
#         answer = chain(
#             {"input_documents": docs, "question": query}, return_only_outputs=True
#         )
#         sources_indexes = re.findall(r"\d+", answer["output_text"].splitlines()[-1])
#         sources_indexes = [int(i) for i in sources_indexes]
#         sources_list = []
#         for idx in sources_indexes:
#             sources_list.append(texts[idx])

#         # remove sources from answer
#         answer_str = answer["output_text"].split("\nSOURCES:")[0]

#         response = {"answer": answer_str, "sources": sources_list}

#         # code to load embeddings
#         return response


class AnswerRetriever:
    def get_answer(self, embeddings, query):
        # texts = embeddings["texts"]
        # docsearch = embeddings["docsearch"]
        texts = embeddings[1]
        docsearch = embeddings[0]
        docs = docsearch.similarity_search(query)
        chain = load_qa_with_sources_chain(OpenAI(temperature=0), chain_type="stuff")
        answer = chain(
            {"input_documents": docs, "question": query}, return_only_outputs=False
        )
        sources_indexes = re.findall(r"\d+", answer["output_text"].splitlines()[-1])
        sources_indexes = [int(i) for i in sources_indexes]
        sources_list = []
        for idx in sources_indexes:
            sources_list.append(texts[idx])

        # remove sources from answer
        answer_str = answer["output_text"].split("\nSOURCES:")[0]

        response = {"answer": answer_str, "sources": sources_list}

        # code to load embeddings
        return response, answer


document = "tsla_earnings_transcript_q4_2022.txt"

# embedded_file_path = (
#     EmbeddingsService.EMBEDDINGS_PATH + "/" + document + ".embedding.pkl"
# )
# print(embedded_file_path)
# print(os.path.exists(embedded_file_path))
# embeddings = EmbeddingsService.load_embeddings(document)


# a function that takes a file and an interval that deterimines the distance between each timestamp in the
# outputted dictionary
def transcribe_time_stamps(segments: list):
    string = ""
    for seg in segments:
        string += "".join(
            [
                str(round(float(seg.start), 2)),
                " - ",
                str(round(float(seg.end), 2)),
                " : ",
                "\n",
                seg.text.strip(),
                "\n",
            ]
        )
    return string


def transcribe_time_stamps_list(segments: list):
    string_list = []
    for seg in segments:
        edited_seg = "".join(
            str(round(float(seg.start), 2)),
            " - ",
            str(round(float(seg.end), 2)),
            " : ",
            "\n",
            seg.text.strip(),
            "\n",
        )
        string_list.append(edited_seg)
    return string_list


def transcribe_time_stamps_for_response(segments: list):
    string = ""
    for seg in segments:
        string += "".join(
            [
                str(round(float(seg.start), 2)),
                " - ",
                str(round(float(seg.end), 2)),
                " : ",
                seg.text.strip(),
                "\n",
            ]
        )
    return string


# def transcribe_time_stamps(segments: list):
#     string = ""
#     for seg in segments:
#         string += "\n".join(
#             [str(seg.start), "->", str(seg.end), ": ", seg.text.strip()]
#         )
#     return string


class WhisperTextLoader(BaseLoader):
    def __init__(self, whisper_text: str, filename: str):
        """Initialize with file path."""
        self.whisper_text = whisper_text
        self.filename = filename

    def load(self) -> List[Document]:
        """Load from file path."""
        # text = self.whisper_text

        metadata = {"source": self.filename}
        return [Document(page_content=self.whisper_text, metadata=metadata)]


# Create your views here.
# Message
@api_view(["GET", "POST", "DELETE"])
def message_list(request):
    if request.method == "GET":
        messages = Message.objects.all()

        name = request.query_params.get("name", None)
        if name is not None:
            messages = messages.filter(name__icontains=name)

        message_serializer = MessageSerializer(messages, many=True)
        return JsonResponse(message_serializer.data, safe=False)
        # return JsonResponse({'message': 'ok!'})

        # 'safe=False' for objects serialization

    elif request.method == "POST":
        message_data = JSONParser().parse(request)

        # print("TEST", message_data)

        history = {"message": {}}
        query = message_data["message"]
        results = AnswerRetriever().get_answer(embeddings, query)
        history["message"]["query"] = query
        history["message"]["answer"] = results["answer"]
        history["message"]["source"] = results["sources"]
        history["message"] = str(history["message"])

        # message_serializer = MessageSerializer(data=message_data)
        message_serializer = MessageSerializer(data=history)

        if message_serializer.is_valid():
            message_serializer.save()
            return JsonResponse(message_serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(
            message_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )
        return JsonResponse({"message": "ok!"})

    elif request.method == "DELETE":
        count = Message.objects.all().delete()
        return JsonResponse(
            {"message": "{} Messages were deleted successfully!".format(count[0])},
            status=status.HTTP_204_NO_CONTENT,
        )


# Watch History
@api_view(["GET", "POST", "DELETE"])
def watch_history_list(request):
    if request.method == "GET":
        watch_history = WatchHistory.objects.all()

        name = request.query_params.get("name", None)
        if name is not None:
            watch_history = watch_history.filter(name__icontains=name)

        watch_history_serializer = WatchHistorySerializer(watch_history, many=True)
        return JsonResponse(watch_history_serializer.data, safe=False)
        # return JsonResponse({'message': 'ok!'})

        # 'safe=False' for objects serialization

    elif request.method == "POST":
        watch_history_data = JSONParser().parse(request)

        # message_serializer = MessageSerializer(data=message_data)
        watch_history_serializer = WatchHistorySerializer(data=watch_history_data)

        if watch_history_serializer.is_valid():
            watch_history_serializer.save()
            return JsonResponse(
                watch_history_serializer.data, status=status.HTTP_201_CREATED
            )
        return JsonResponse(
            watch_history_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == "DELETE":
        count = WatchHistory.objects.all().delete()
        return JsonResponse(
            {
                "message": "{} Watch histories were deleted successfully!".format(
                    count[0]
                )
            },
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(["GET", "POST", "DELETE"])
def video_overall_list(request):
    if request.method == "GET":
        youtube_overall_list = Transcript.objects.all()

        name = request.query_params.get("name", None)
        if name is not None:
            youtube_overall_list = youtube_overall_list.filter(name__icontains=name)

        youtube_overall_list_serializer = TranscriptSerializer(
            youtube_overall_list, many=True
        )
        return JsonResponse(youtube_overall_list_serializer.data, safe=False)
        # return JsonResponse({'message': 'ok!'})

        # 'safe=False' for objects serialization

    elif request.method == "POST":
        youtube_overall_list_data = JSONParser().parse(request)

        # message_serializer = MessageSerializer(data=message_data)
        youtube_overall_list_serializer = TranscriptSerializer(
            data=youtube_overall_list_data
        )

        if youtube_overall_list_serializer.is_valid():
            youtube_overall_list_serializer.save()
            return JsonResponse(
                youtube_overall_list_serializer.data, status=status.HTTP_201_CREATED
            )
        return JsonResponse(
            youtube_overall_list_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == "DELETE":
        count = Transcript.objects.all().delete()
        return JsonResponse(
            {"message": "{} transcripts were deleted successfully!".format(count[0])},
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(["POST"])
def video_list(request, transcriptUrl):
    if request.method == "POST":
        try:
            transcript = Transcript.objects.get(transcriptUrl=transcriptUrl)
            transcript_serializer = TranscriptSerializer(transcript)
            transcript_data = transcript_serializer.data
        # print("before", transcript)
        # if transcript is None:
        #     print(transcript)

        # print("TEST", transcript)

        # print("TEST", transcript_data)

        # transcriptUrlGet = request.query_params.get("transcriptUrl", None)

        # print(transcriptUrlGet)
        except:
            transcript_data = None

        if transcript_data is not None:
            return JsonResponse({"message": transcript_data["transcript"]})
        else:
            print("else", transcriptUrl)
            # customers = customers.filter(customerId__icontains=customerId)

            url_data = JSONParser().parse(request)
            yt = YouTube(url_data["videoUrl"])
            stream = yt.streams.get_by_itag(251)
            download = stream.download(output_path="/Users/samuel/docquery/tmp")

            model_type = "tiny"
            # data_path = "/Users/samuel/docquery/tmp"
            # url = 'https://www.youtube.com/watch?v=reUZRyXxUs4'

            model = stable_whisper.load_model(model_type)
            result = model.transcribe(download, regroup=False)

            timestamps_text = transcribe_time_stamps(result.segments)
            # timestamps_text = transcribe_time_stamps_list(result.segments)

            timestamps_text_for_response = transcribe_time_stamps_for_response(
                result.segments
            )

            transcript_data = {
                "transcript": {},
                "transcriptResponse": {},
                "transcriptUrl": {},
            }
            transcript_data["transcript"] = timestamps_text
            transcript_data["transcriptResponse"] = timestamps_text_for_response
            transcript_data["transcriptUrl"] = transcriptUrl

            transcript_serializer = TranscriptSerializer(data=transcript_data)

            if transcript_serializer.is_valid():
                transcript_serializer.save()
                return JsonResponse(
                    {"message": transcript_serializer.data["transcript"]},
                    status=status.HTTP_201_CREATED,
                )
            return JsonResponse(
                transcript_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        # return JsonResponse({"message": timestamps_text})
        return JsonResponse({"message": "test"})


@api_view(["GET", "POST", "DELETE"])
def videochat_list(request):
    if request.method == "GET":
        messages = Message.objects.all()

        name = request.query_params.get("name", None)
        if name is not None:
            messages = messages.filter(name__icontains=name)

        message_serializer = MessageSerializer(messages, many=True)
        return JsonResponse(message_serializer.data, safe=False)
        # return JsonResponse({'message': 'ok!'})

        # 'safe=False' for objects serialization

    elif request.method == "POST":
        message_data = JSONParser().parse(request)

        text_splitter = CharacterTextSplitter(
            separator="\n", chunk_size=1000, chunk_overlap=0, length_function=len
        )
        texts = text_splitter.split_text(message_data["text"])

        embeddings = OpenAIEmbeddings()

        docsearch = FAISS.from_texts(
            texts, embeddings, metadatas=[{"source": i} for i in range(len(texts))]
        )
        v = [docsearch, texts]

        results, answer = AnswerRetriever().get_answer(v, message_data["query"])

        # print("TEST", message_data)

        # history = {"message": {}}
        # query = message_data["message"]
        # results = AnswerRetriever().get_answer(embeddings, query)
        # history["message"]["query"] = query
        # history["message"]["answer"] = results["answer"]
        # history["message"]["source"] = results["sources"]
        # history["message"] = str(history["message"])

        # # message_serializer = MessageSerializer(data=message_data)
        # message_serializer = MessageSerializer(data=history)

        # if message_serializer.is_valid():
        #     message_serializer.save()
        #     return JsonResponse(message_serializer.data, status=status.HTTP_201_CREATED)
        # return JsonResponse(
        #     message_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        # )
        return JsonResponse(
            {"answer": results["answer"], "sources": results["sources"]}
        )

    elif request.method == "DELETE":
        count = Message.objects.all().delete()
        return JsonResponse(
            {"message": "{} Messages were deleted successfully!".format(count[0])},
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(["GET", "POST", "DELETE"])
def videochat_detailed_list(request, videoUrlId):
    if request.method == "GET":
        messages = Message.objects.all()

        name = request.query_params.get("name", None)
        if name is not None:
            messages = messages.filter(name__icontains=name)

        message_serializer = MessageSerializer(messages, many=True)
        return JsonResponse(message_serializer.data, safe=False)
        # return JsonResponse({'message': 'ok!'})

        # 'safe=False' for objects serialization

    elif request.method == "POST":
        try:
            transcript = Transcript.objects.get(transcriptUrl=videoUrlId)
            transcript_serializer = TranscriptSerializer(transcript)
            transcript_data = transcript_serializer.data
            transcript_response = transcript_data["transcriptResponse"]

            message_data = JSONParser().parse(request)

            text_splitter = CharacterTextSplitter(
                separator="\n", chunk_size=1000, chunk_overlap=0, length_function=len
            )
            texts = text_splitter.split_text(transcript_response)

            embeddings = OpenAIEmbeddings()

            docsearch = FAISS.from_texts(
                texts, embeddings, metadatas=[{"source": i} for i in range(len(texts))]
            )
            v = [docsearch, texts]

            results, answer = AnswerRetriever().get_answer(v, message_data["query"])

            return JsonResponse(
                {"answer": results["answer"], "sources": results["sources"]}
            )
        except:
            return JsonResponse({"message": "error"})

    elif request.method == "DELETE":
        count = Message.objects.all().delete()
        return JsonResponse(
            {"message": "{} Messages were deleted successfully!".format(count[0])},
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(["POST"])
def generate_questions_list(request, transcriptUrl):
    if request.method == "POST":
        try:
            message_data = JSONParser().parse(request)
            transcriptUrlId = message_data["transcriptUrl"]
            transcript = Transcript.objects.get(transcriptUrl=transcriptUrlId)
            transcript_serializer = TranscriptSerializer(transcript)
            transcript_data = transcript_serializer.data

            transcript_response = transcript_data["transcriptResponse"]

            map_prompt = """You are a helpful AI bot that aids a user in research.
            Below is information about a transcript from a video.
            Information will include explanations of concepts relating to the topic.
            Your goal is to generate study questions based on the information provided in the 
            video transcript that we can use for our study notes.
            Use specifics from the research when possible.

            % START OF INFORMATION FROM THE TRANSCRIPT:
            {text}
            % END OF INFORMATION FROM THE TRANSCRIPT:

            Please respond with a short list that contains 10 questions based on the topics above

            YOUR RESPONSE:"""
            combine_prompt_template = PromptTemplate(
                template=map_prompt, input_variables=["text"]
            )

            llm = ChatOpenAI(temperature=0.25)

            chain = load_summarize_chain(
                llm,
                chain_type="map_reduce",
                map_prompt=combine_prompt_template,
                combine_prompt=combine_prompt_template,
                #                              verbose=True
            )

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=3000, chunk_overlap=0
            )
            docs = text_splitter.create_documents([transcript_response])

            output = chain({"input_documents": docs})

            return JsonResponse({"message": output["output_text"]})
        except:
            # return JsonResponse({"message": timestamps_text})
            return JsonResponse({"message": "error"})


@api_view(["POST"])
def explain_like_five_list(request):
    if request.method == "POST":
        try:
            message_data = JSONParser().parse(request)
            # llmResponse = message_data["llmResponse"]
            userQuery = message_data["userQuery"]

            transcriptUrlId = message_data["transcriptUrl"]

            transcript = Transcript.objects.get(transcriptUrl=transcriptUrlId)
            transcript_serializer = TranscriptSerializer(transcript)
            transcript_data = transcript_serializer.data
            transcript_response = transcript_data["transcriptResponse"]

            map_prompt = """You are a helpful AI bot that aids a user in understanding complex concepts.
            Below is information about a transcript from a video, and the query that the user has regarding information about the video.
            The information from the video will include explanations of concepts.
            Your goal is to explain these concepts to the user like they are five based on the information provided in the video transcript.
            Use simple analogies for explanations when possible.

            % START OF INFORMATION FROM THE TRANSCRIPT:
            {text}
            % END OF INFORMATION FROM THE TRANSCRIPT:

            % START OF USER QUERY:
            {userQuery}
            % END OF USER QUERY:

            Please respond with explanation of concepts to the user like they are five.

            YOUR RESPONSE:"""

            combine_prompt_template = PromptTemplate(
                template=map_prompt,
                input_variables=["text", "userQuery"],
            )

            llm = ChatOpenAI(temperature=0.25)

            # print(userQuery, transcript_response)

            chain = load_summarize_chain(
                llm,
                chain_type="map_reduce",
                # prompt=combine_prompt_template
                map_prompt=combine_prompt_template,
                combine_prompt=combine_prompt_template,
                #                              verbose=True
            )

            # chain = LLMChain(llm, prompt=combine_prompt_template)

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=3000, chunk_overlap=0
            )

            docs = text_splitter.create_documents([transcript_response])

            output = chain({"input_documents": docs, "userQuery": userQuery})

            return JsonResponse({"message": output["output_text"]})
        except:
            # return JsonResponse({"message": timestamps_text})
            return JsonResponse({"message": "error"})
