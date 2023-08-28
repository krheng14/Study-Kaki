from rest_framework import serializers
from .models import *


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "messageId",
            "message",
            "createdAt",
            "updatedAt",
        )
        model = Message


class WatchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "videoId",
            "videoUrl",
            "videoThumbnailUrl",
            "videoAuthor",
            "videoName",
            "createdAt",
            "updatedAt",
        )
        model = WatchHistory


class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "transcriptId",
            "transcript",
            "transcriptResponse",
            "transcriptUrl",
            "createdAt",
            "updatedAt",
        )
        model = Transcript
