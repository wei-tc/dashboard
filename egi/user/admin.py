from django.contrib import admin

from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from user.models import User


@admin.register(User)
class DataPermissionUserAdmin(UserAdmin):
    model = get_user_model()

    fieldsets = (
                    ('Data Permissions', {'fields': ('dataset', 'plot',)}),
                ) + UserAdmin.fieldsets

    add_fieldsets = (
        (None, {'classes': ('wide',),
                'fields': ('username', 'password1', 'password2', 'is_staff')}),
        ('Data Permissions', {'fields': ('dataset', 'plot')}),
    )

    filter_horizontal = ('groups', 'user_permissions', 'dataset', 'plot')

    list_display = ['username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active']
    list_editable = ['first_name', 'last_name', 'email', 'is_staff', 'is_active']

    search_fields = ['username', 'email', 'first_name', 'last_name']
