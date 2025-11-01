# API/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

# --- PROJECT ---
class IsProjectOwnerOrMember(BasePermission):
    """
    - Nếu request là SAFE_METHODS (GET, HEAD, OPTIONS): cho phép nếu user là owner hoặc là member.
    - Nếu request là phương thức thay đổi (PUT, PATCH, DELETE, POST...): chỉ owner mới được.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user == obj.owner or request.user in obj.members.all()
        return request.user == obj.owner


# --- TASK ---
class IsProjectMemberOrAssignee(BasePermission):
    """
    - SAFE_METHODS: cho phép nếu user là owner project OR member project OR assignee của task.
    - PUT/PATCH: cho phép nếu user là assignee OR owner project.
    - DELETE: chỉ owner project.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method in SAFE_METHODS:
            return (
                user == obj.project.owner or
                user in obj.project.members.all() or
                user == obj.assignee
            )
        if request.method in ('PUT', 'PATCH'):
            return user == obj.assignee or user == obj.project.owner
        if request.method == 'DELETE':
            return user == obj.project.owner
        return False


# --- COMMENT / ATTACHMENT ---
class IsProjectMemberOrAuthor(BasePermission):
    """
    Dùng cho Comment/Attachment:
    - SAFE_METHODS: thành viên project (owner or members) được xem.
    - PUT/PATCH/DELETE: chỉ author/uploader mới được.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        # tất cả comment/attachment có liên quan đến một task -> lấy project qua obj.task.project
        if request.method in SAFE_METHODS:
            return (
                user == obj.task.project.owner or
                user in obj.task.project.members.all()
            )
        # sửa/xóa => nếu obj có trường author/uploader thì so sánh
        if hasattr(obj, "author"):
            return obj.author == user
        if hasattr(obj, "uploader"):
            return obj.uploader == user
        return False
