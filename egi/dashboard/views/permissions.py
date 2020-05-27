from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsStaffOrIsUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.user == request.user and request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_staff


class IsStaffOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_staff
