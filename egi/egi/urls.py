from django.conf.urls import url
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard', permanent=True), name='home'),
    path('admin/', admin.site.urls, name='admin'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/login', auth_views.LoginView.as_view(template_name='authentication/login.html'), name='login'),
    path('dashboard/', include('dashboard.urls'), name='dashboard'),
    path('api/v1/', include([
        path('datasets/', include('dataset.urls'), name='dataset'),
        path('industry-standards/', include('industry_standard.urls'), name='industry_standard'),
        path('permissions/', include('user.urls'), name='permission'),
        path('plots/', include('plot.urls'), name='plot')
    ])),
    url(r'^health/?', include('health_check.urls'))
]
