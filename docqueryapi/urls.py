from django.urls import path, re_path, include

from . import views

urlpatterns = [
    re_path(r"^chat$", views.message_list),
    re_path(r"^watchhistory$", views.watch_history_list),
    re_path(r"^youtubeurl$", views.video_overall_list),
    re_path(r"^youtubeurl/(?P<transcriptUrl>[a-zA-Z0-9_.-]*)$", views.video_list),
    re_path(r"^youtubechat$", views.videochat_list),
    re_path(
        r"^youtubechat/(?P<videoUrlId>[a-zA-Z0-9_.-]*)$",
        views.videochat_detailed_list,
    ),
    re_path(
        r"^generatequestions/(?P<transcriptUrl>[a-zA-Z0-9_.-]*)$",
        views.generate_questions_list,
    ),
    re_path(
        r"^explainlikefive$",
        views.explain_like_five_list,
    ),
]
