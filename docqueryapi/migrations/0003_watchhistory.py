# Generated by Django 4.0.2 on 2023-07-01 15:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('docqueryapi', '0002_alter_message_message'),
    ]

    operations = [
        migrations.CreateModel(
            name='WatchHistory',
            fields=[
                ('videoId', models.BigAutoField(primary_key=True, serialize=False)),
                ('videoUrl', models.CharField(max_length=150000)),
                ('videoThumbnailUrl', models.CharField(max_length=150000)),
                ('videoAuthor', models.CharField(max_length=150000)),
                ('videoName', models.CharField(max_length=150000)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('updatedAt', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
