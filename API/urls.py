from django.urls import path
from . import views

urlpatterns = [
    # Người dùng
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),

    # Dự án (Projects)
    path('projects/', views.ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),

    # Công việc (Tasks)
    path('projects/<int:pk>/tasks/', views.TaskListView.as_view(), name='task-list'),
    path('projects/<int:project_pk>/tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),

    # Bình luận (Comments)
    path('projects/<int:project_pk>/tasks/<int:task_pk>/comments/', views.CommentListView.as_view(), name='comment-list'),
    path('projects/<int:project_pk>/tasks/<int:task_pk>/comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),

    # Tệp đính kèm (Attachments)
    path('projects/<int:project_pk>/tasks/<int:task_pk>/attachments/', views.AttachmentListView.as_view(), name='attachment-list'),
    path('projects/<int:project_pk>/tasks/<int:task_pk>/attachments/<int:pk>/', views.AttachmentDetailView.as_view(), name='attachment-detail'),

    # Nhật ký hoạt động (Activity Log)
    path('projects/<int:project_pk>/activity/', views.ActivityLogProjectView.as_view(), name='activity-project'),
    path('projects/<int:project_pk>/tasks/<int:task_pk>/activity/', views.ActivityLogTaskView.as_view(), name='activity-task'),
]
