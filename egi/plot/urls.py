from rest_framework.routers import DefaultRouter

from .views import PlotViewSet

app_name = 'plot'

router = DefaultRouter(trailing_slash=True)

router.register('', PlotViewSet, 'plot')

urlpatterns = router.urls
