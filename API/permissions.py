from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.db.models import Q
from .models import Project, Task


# ===============================
# 🔹 PROJECT PERMISSIONS
# ===============================
class CanViewProjectList(BasePermission):
    """
    ListView: Admin xem tất cả, 
    còn lại: owner hoặc member của project.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def filter_queryset(self, request):
        user = request.user
        if user.is_staff:
            return Project.objects.all()
        return Project.objects.filter(Q(owner=user) | Q(members=user)).distinct()


class IsProjectOwnerOrMember(BasePermission):
    """
    DetailView:
    - Owner: full quyền
    - Member: chỉ xem
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if request.method in SAFE_METHODS:
            return request.user in obj.members.all() or request.user == obj.owner
        return request.user == obj.owner


# ===============================
# 🔹 TASK PERMISSIONS
# ===============================
class CanViewTaskList(BasePermission):
    """
    ListView: Admin thấy tất cả,
    còn lại: chỉ xem task thuộc project mình là owner/member.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def filter_queryset(self, request, project_pk):
        user = request.user
        if user.is_staff:
            return Task.objects.filter(project_id=project_pk)
        return Task.objects.filter(
            project__id=project_pk,
            project__members=user
        ) | Task.objects.filter(project__id=project_pk, project__owner=user)


class IsTaskPermission(BasePermission):
    """
    DetailView:
    - Chủ project: full quyền
    - Member/Assignee: xem + sửa
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_staff:
            return True

        project = obj.project
        is_owner = user == project.owner
        is_member = user in project.members.all()
        is_assignee = user == obj.assignee

        if request.method in SAFE_METHODS:
            return is_owner or is_member or is_assignee
        if request.method in ['PUT', 'PATCH']:
            return is_owner or is_member or is_assignee
        if request.method == 'DELETE':
            return is_owner
        return False


# ===============================
# 🔹 COMMENT & ATTACHMENT
# ===============================
class CanViewCommentOrAttachmentList(BasePermission):
    """
    ListView:
    - Admin, owner, member: được xem
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsCommentOrAttachmentOwner(BasePermission):
    """
    DetailView:
    - Member dự án: được xem
    - Tác giả/uploader: được sửa/xóa
    - Chủ dự án: được xóa
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_staff:
            return True

        project = obj.task.project
        is_owner = user == project.owner
        is_member = user in project.members.all()
        author_or_uploader = getattr(obj, 'author', None) or getattr(obj, 'uploader', None)
        is_author = user == author_or_uploader

        if request.method in SAFE_METHODS:
            return is_owner or is_member
        if request.method == 'DELETE' and is_owner:
            return True
        return is_author


# ===============================
# 🔹 ACTIVITY LOG
# ===============================
class CanViewActivityLog(BasePermission):
    """
    Chỉ owner, member, hoặc admin được xem.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
