from django.urls import path
from . import views

urlpatterns = [
    # Project
    path('projects/', views.ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),

    # Task trong Project
    path('projects/<int:pk>/tasks/', views.TaskListView.as_view(), name='task-list'),
    path('projects/<int:project_pk>/tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),

    # Comment trong Task
    path('projects/<int:project_pk>/tasks/<int:task_pk>/comments/', views.CommentListView.as_view(), name='comment-list'),
    path('projects/<int:project_pk>/tasks/<int:task_pk>/comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
]
