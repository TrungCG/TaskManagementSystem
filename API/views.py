from functools import partial
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User, Project, Task, Comment, Attachment, ActivityLog
from .serializers import (
    SignupSerializer, UserSerializer, ProjectSerializer,
    TaskSerializer, CommentSerializer, AttachmentSerializer, ActivityLogSerializer
)



# Hàm tiện ích để tạo bản ghi nhật ký hoạt động
def create_activity_log(user, action_description, project=None, task=None):
    ActivityLog.objects.create(
        actor=user,
        action_description=action_description,
        project=project,
        task=task
    )


# SIGNUP (đăng ký người dùng)
class SignupView(APIView):
    def post(self, request):
        user = SignupSerializer(data=request.data)
        if user.is_valid():
            user.save()
            return Response(user.data, status=status.HTTP_201_CREATED)
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)


# USER DETAIL VIEW (hiển thị chi tiết người dùng)
class UserDetailView(APIView):
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

 
# PROJECT LIST / CREATE VIEW (danh sách/tạo dự án)
class ProjectListView(APIView):
    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        project = ProjectSerializer(data=request.data)
        if project.is_valid():
            project_instance = project.save(owner=request.user)
            create_activity_log(
                user=request.user,
                action_description=f"Tạo dự án mới: {project_instance.name}",
                project=project_instance
            )
            return Response(project.data, status=status.HTTP_201_CREATED)
        return Response(project.errors, status=status.HTTP_400_BAD_REQUEST)


# PROJECT DETAIL VIEW (chi tiết dự án)
class ProjectDetailView(APIView):
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            create_activity_log(
                user=request.user,
                action_description=f"Cập nhật dự án: {project.name}",
                project=project
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            create_activity_log(
                user=request.user,
                action_description=f"Sửa một phần dự án: {project.name}",
                project=project
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        create_activity_log(
            user=request.user,
            action_description=f"Xóa dự án: {project.name}",
            project=project
        )
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# TASK LIST / CREATE VIEW (danh sách/tạo công việc)
class TaskListView(APIView):
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        tasks = Task.objects.filter(project=project)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        task = TaskSerializer(data=request.data)
        if task.is_valid():
            task_instance = task.save(project=project, assignee=request.user)
            create_activity_log(
                user=request.user,
                action_description=f"Tạo công việc: {task_instance.title}",
                project=project,
                task=task_instance
            )
            return Response(task.data, status=status.HTTP_201_CREATED)
        return Response(task.errors, status=status.HTTP_400_BAD_REQUEST)


# TASK DETAIL VIEW (chi tiết công việc)
class TaskDetailView(APIView):
    def get(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save(project=task.project)
            create_activity_log(
                user=request.user,
                action_description=f"Cập nhật công việc: {task.title}",
                project=task.project,
                task=task
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(project=task.project)
            create_activity_log(
                user=request.user,
                action_description=f"Sửa công việc: {task.title}",
                project=task.project,
                task=task
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        create_activity_log(
            user=request.user,
            action_description=f"Xóa công việc: {task.title}",
            project=task.project,
            task=task
        )
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# COMMENT LIST / CREATE VIEW (danh sách/tạo bình luận)
class CommentListView(APIView):
    def get(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        comments = Comment.objects.filter(task=task)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        comment = CommentSerializer(data=request.data)
        if comment.is_valid():
            comment_instance = comment.save(author=request.user, task=task)
            create_activity_log(
                user=request.user,
                action_description=f"Thêm bình luận vào công việc: {task.title}",
                project=task.project,
                task=task
            )
            return Response(comment.data, status=status.HTTP_201_CREATED)
        return Response(comment.errors, status=status.HTTP_400_BAD_REQUEST)


# ATTACHMENT LIST / CREATE VIEW (danh sách/tạo tập tin đính kèm)
class AttachmentListView(APIView):
    def get(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        attachments = Attachment.objects.filter(task=task)
        serializer = AttachmentSerializer(attachments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        attachment = AttachmentSerializer(data=request.data)
        if attachment.is_valid():
            attachment_instance = attachment.save(uploader=request.user, task=task)
            create_activity_log(
                user=request.user,
                action_description=f"Tải lên tệp đính kèm cho công việc: {task.title}",
                project=task.project,
                task=task
            )
            return Response(attachment.data, status=status.HTTP_201_CREATED)
        return Response(attachment.errors, status=status.HTTP_400_BAD_REQUEST)


# ACTIVITY LOG VIEW (xem nhật ký hoạt động cho dự án cụ thể)
class ActivityLogProjectView(APIView):
    def get(self, request, project_pk):
        try:
            project = Project.objects.get(pk=project_pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        logs = ActivityLog.objects.filter(project=project).order_by('-timestamp')
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ACTIVITY LOG VIEW (xem nhật ký hoạt động cho công việc cụ thể)
class ActivityLogTaskView(APIView):
    def get(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        logs = ActivityLog.objects.filter(task=task).order_by('-timestamp')
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
