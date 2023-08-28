from django.db import models


# Create your models here.
class Message(models.Model):
    messageId = models.BigAutoField(primary_key=True)
    message = models.CharField(max_length=150000)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.messageId


class WatchHistory(models.Model):
    videoId = models.BigAutoField(primary_key=True)
    videoUrl = models.CharField(max_length=150000)
    videoThumbnailUrl = models.CharField(max_length=150000)
    videoAuthor = models.CharField(max_length=150000)
    videoName = models.CharField(max_length=150000)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.videoId


class Transcript(models.Model):
    transcriptId = models.BigAutoField(primary_key=True)
    transcript = models.CharField(max_length=150000)
    transcriptResponse = models.CharField(max_length=150000)
    transcriptUrl = models.CharField(max_length=150000)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.transcriptId
