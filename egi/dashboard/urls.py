from django.urls import path

from .views.views import DashboardDispatchView, CreateDispatchView

urlpatterns = [
    path('', DashboardDispatchView.as_view(), name='dashboard'),
    path('create/', CreateDispatchView.as_view(), name='create'),
]
