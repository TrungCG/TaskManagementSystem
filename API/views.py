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
    def post(self, request):
        user = SignupSerializer(data = request.data)
        if user.is_valid():
            user.save()
            return Response(user.data, status=status.HTTP_201_CREATED)
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

    
# VIEW USER DETAIL (chi tiết người dùng)
class UserDetailView(APIView):
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
# VIEW PROJECT LIST/CREATE (danh sách/tạo dự án)
class ProjectView(APIView):
    # Lấy danh sách dự án hoặc chi tiết một dự án  
    def get(self, request, pk=None):
        if pk:
            try:
                project = Project.objects.get(pk=pk)
            except Project.DoesNotExist:
                return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ProjectSerializer(project)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            projects = Project.objects.all()
            serializer = ProjectSerializer(projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
     
     # Tạo dự án mới   
    def post(self, request):
        project = ProjectSerializer(data=request.data)
        if project.is_valid():
            project.save(owner = request.user)
            return Response(project.data, status=status.HTTP_201_CREATED)
        return Response(project.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Cập nhật dự án
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

    # Cập nhật một phần dự án 
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
    
    # Xóa dự án
    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    
# VIEW TASK LIST/CREATE (danh sách/tạo công việc)
class TaskView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                task = Task.objects.get(pk=pk)
            except Task.DoesNotExist:
                return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
            serializer = TaskSerializer(task)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            tasks = Task.objects.all()
            serializer = TaskSerializer(tasks, many = True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
    def post(self, request,pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Dự án không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        task = TaskSerializer(data = request.data)
        if task.is_valid():
            task.save(project=project, assignee=request.user)
            return Response(task.data, status=status.HTTP_201_CREATED)
        return Response(task.errors, status=status.HTTP_400_BAD_REQUEST)
                    
    def put(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            
        except Task.DoesNotExist:
            return Response({"errors" : "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
    
    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"errors" : "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task, data = request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"errors" : "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)    
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# VIEW COMMENT LIST/CREATE (danh sách/tạo bình luận)
class CommentView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                comment = Comment.objects.get(pk=pk)
            except Comment.DoesNotExist:
                return Response({"error":"Bình luận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            comments = Comment.objects.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"error": "Công việc không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        comment = CommentSerializer(data=request.data)
        if comment.is_valid():
            comment.save(author=request.user, task=task)
            return Response(comment.data, status=status.HTTP_201_CREATED)
        return Response(comment.errors, status=status.HTTP_400_BAD_REQUEST)    
    
    def put(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CommentSerializer(comment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"error":"Bình luận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        