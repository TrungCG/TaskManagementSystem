from functools import partial
from os import error
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User, Project, Task, Comment, Attachment, ActivityLog
from .serializers import SignupSerializer, UserSerializer, ProjectSerializer
from .serializers import TaskSerializer, CommentSerializer, AttachmentSerializer, ActivityLogSerializer
from API import serializers


# VIEW SIGNUP (đăng ký người dùng)
class SignupView(APIView):
    # New user registration
    def post(self, request):
        user = SignupSerializer(data = request.data)
        if user.is_valid():
            user.save()
            return Response(user.data, status=status.HTTP_201_CREATED)
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

    
# VIEW USER DETAIL (chi tiết người dùng)
class UserDetailView(APIView):
    # User details
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
   
    
# VIEW PROJECT LIST/CREATE (danh sách/tạo dự án)
class ProjectListView(APIView):
    # Get project list
    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Create a new project
    def post(self, request):
        project = ProjectSerializer(data=request.data)
        if project.is_valid():
            project.save(owner = request.user)
            return Response(project.data, status=status.HTTP_201_CREATED)
        return Response(project.errors, status=status.HTTP_400_BAD_REQUEST)
 
    
# VIEW PROJECT DETAIL/UPDATE/DELETE (chi tiết/cập nhật/xóa dự án)
class ProjectDetailView(APIView):
    # Get project details 
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)        

    # Update the entire project
    def put(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Update a part of the project
    def patch(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data = request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete a project
    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

# VIEW TASK LIST/CREATE (danh sách/tạo công việc)
class TaskListView(APIView):
    # Get task list for a project
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        tasks = Task.objects.filter(project=project)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
  
    # Create a new task in a project
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)        
        task = TaskSerializer(data=request.data)
        if task.is_valid():
            task.save(project=project, assignee=request.user)
            return Response(task.data, status=status.HTTP_201_CREATED)
        return Response(task.errors, status=status.HTTP_400_BAD_REQUEST)
    

# VIEW TASK DETAIL/UPDATE/DELETE (chi tiết/cập nhật/xóa công việc)   
class TaskDetailView(APIView):
    # Get task details
    def get(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại trong dự án này."}, status=status.HTTP_404_NOT_FOUND)       
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Update the entire task 
    def put(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"errors": "Công việc không tồn tại trong dự án này."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            # Luôn giữ task trong project hiện tại
            serializer.save(project=task.project)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
    
    # Update a part of the task
    def patch(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"errors": "Công việc không tồn tại trong dự án này."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(project=task.project)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete a task
    def delete(self, request, project_pk, pk):
        try:
            task = Task.objects.get(pk=pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"errors": "Công việc không tồn tại trong dự án này."}, status=status.HTTP_404_NOT_FOUND)    

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    

# VIEW COMMENT LIST/CREATE (danh sách/tạo bình luận)
class CommentListView(APIView):
    # Get all comments for a task
    def get(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk) # tasks must belong to the project
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại trong dự án này."}, status=status.HTTP_404_NOT_FOUND)
        comments = Comment.objects.filter(task=task) # Get comments on that job
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Create a new comment for a task
    def post(self, request, project_pk, task_pk):
        try:
            task = Task.objects.get(pk=task_pk, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại trong dự án này."}, status=status.HTTP_404_NOT_FOUND)
        comment = CommentSerializer(data=request.data)
        if comment.is_valid():
            comment.save(author=request.user, task=task)
            return Response(comment.data, status=status.HTTP_201_CREATED)
        return Response(comment.errors, status=status.HTTP_400_BAD_REQUEST)
 

# VIEW COMMENT DETAIL/UPDATE/DELETE (chi tiết/cập nhật/xóa bình luận)   
class CommentDetailView(APIView):
    # Get comment details
    def get(self, request, project_pk, task_pk, pk):
        try:
            comment = Comment.objects.get(pk=pk, task__pk=task_pk, task__project_id=project_pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại trong công việc này."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Update the entire comment          
    def put(self, request, project_pk, task_pk, pk):
        try:
            comment = Comment.objects.get(pk=pk, task__pk=task_pk, task__project_id=project_pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại trong công việc này."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CommentSerializer(comment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Update a part of the comment
    def patch(self, request, project_pk, task_pk, pk):
        try:
            comment = Comment.objects.get(pk=pk, task__pk=task_pk, task__project_id=project_pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại trong công việc này."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete a comment
    def delete(self, request, project_pk, task_pk, pk):
        try:
            comment = Comment.objects.get(pk=pk, task__pk=task_pk, task__project_id=project_pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại trong công việc này."}, status=status.HTTP_404_NOT_FOUND)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    
    