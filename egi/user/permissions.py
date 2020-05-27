from common.util.permissions import IsStaff


class IsStaffOrRequestedUser(IsStaff):
    def forbidden_permissions_hook(self, request, view):
        return request.method in ['CREATE', 'PUT']

    def has_object_permission_hook(self, request, view, obj):
        return obj == request.user
