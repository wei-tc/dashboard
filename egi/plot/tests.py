import os
import fnmatch
from collections import OrderedDict

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from dataset.models import Dataset
from .models import Plot
from .serializers import PlotSerializer

client_dataset_name = 'django_client_dataset_test'
client_dataset_2_name = 'django_client_2_dataset_test'

client_details = {'username': 'client', 'password': '1234'}
client_2_details = {'username': 'client2', 'password': '1234'}
staff_details = {'username': 'staff', 'password': '1234'}
staff_2_details = {'username': 'staff2', 'password': '1234'}

dash_app_name = 'dash'
plot_name = 'plot1'
plot_2_name = 'plot2'


class PlotSetupMixin(object):
    def setUp(self):
        self.create_initial_data()
        super(PlotSetupMixin, self).setUp()

    @classmethod
    def create_initial_data(cls):
        client_dataset = Dataset.objects.create(
            name=client_dataset_name,
            creation_date=timezone.now(),
            description=client_dataset_name,
            file=SimpleUploadedFile(
                name='test.csv',
                content=open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb').read(),
                content_type='text/csv')
        )

        client_dataset_2 = Dataset.objects.create(
            name=client_dataset_2_name,
            creation_date=timezone.now(),
            description=client_dataset_2_name,
            file=SimpleUploadedFile(
                name='test.csv',
                content=open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb').read(),
                content_type='text/csv')
        )

        plot = Plot.objects.create(name=plot_name, dataset=client_dataset, plot_type='Geographical')
        plot_2 = Plot.objects.create(name=plot_2_name, dataset=client_dataset_2, plot_type='Scatter')

        client = get_user_model().objects.create_user(**client_details)
        client_2 = get_user_model().objects.create_user(**client_2_details)
        staff = get_user_model().objects.create_user(is_staff=True, **staff_details)
        staff_2 = get_user_model().objects.create_user(is_staff=True, **staff_2_details)

        client.dataset.add(client_dataset)
        client.dataset.add(client_dataset_2)
        client_2.dataset.add(client_dataset_2)

        client.plot.add(plot_2)
        client_2.plot.add(plot)

        staff_2.plot.add(plot)
        staff_2.dataset.add(client_dataset)


class PlotTearDownMixin(object):
    def tearDown(self):
        for file in os.listdir(settings.MEDIA_ROOT):
            if(
                fnmatch.fnmatch(file, f'{client_dataset_name}*.csv') or
                fnmatch.fnmatch(file, f'{client_dataset_2_name}*.csv') or
                fnmatch.fnmatch(file, f'POST_test*.csv') or
                fnmatch.fnmatch(file, f'PUT_test*.csv')
            ):
                os.remove(os.path.join(settings.MEDIA_ROOT, file))

        super(PlotTearDownMixin, self).tearDown()



@override_settings(AXES_ENABLED=False)
class PlotSerializerTest(PlotSetupMixin, PlotTearDownMixin, TestCase):
    def setUp(self):
        super(PlotSerializerTest, self).setUp()
        self.client = APIClient()
        self.client.login(**staff_details)

    def test_serialize_all_ok(self):
        plots = Plot.objects.all()
        self.assertEqual(plots.count(), 2)

        serializer = PlotSerializer(plots, many=True)
        self.assertEqual(serializer.data,
                         [
                             OrderedDict([('name', plot_name),
                                          ('dataset', client_dataset_name),
                                          ('plot_type', 'Geographical'),
                                          ('default_settings', '')]),
                             OrderedDict([('name', plot_2_name),
                                          ('dataset', client_dataset_2_name),
                                          ('plot_type', 'Scatter'),
                                          ('default_settings', '')])
                         ])


@override_settings(AXES_ENABLED=False)
class AnonPlotTest(PlotSetupMixin, PlotTearDownMixin, TestCase):
    def setUp(self):
        super(AnonPlotTest, self).setUp()

        self.client = APIClient()

    def test_detail_realPlot_forbidden(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': plot_name}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_fakePlot_forbidden(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_all_permittedEmpty(self):
        response = self.client.get(reverse('plot:plot-list'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_newPlot_forbidden(self):
        count = Plot.objects.all().count()

        response = self.client.post(reverse('plot:plot-list'), data={
            'name': 'POST_test',
            'dataset': 'django_staff_dataset_test',
            'plot_type': 'Dash',
            'default_settings': 'test time'
        }, format='json')

        self.assertEqual(Plot.objects.all().count(), count)
        self.assertEqual(response.status_code, 403)

    def test_put_goodData_forbidden(self):
        response = self.client.put(reverse('plot:plot-detail', kwargs={'name': 'plot1'}), data={
            'name': 'PUT_test',
            'dataset': 'django_staff_dataset_test',
            'plot_type': 'Geographical',
            'default_settings': 'new settings applied'
        }, format='json')

        self.assertTrue(Plot.objects.filter(name='PUT_test').count() == 0)
        self.assertEqual(response.status_code, 403)


@override_settings(AXES_ENABLED=False)
class ClientPlotTest(PlotSetupMixin, PlotTearDownMixin, TestCase):
    def setUp(self):
        super(ClientPlotTest, self).setUp()

        self.client = APIClient()
        self.client.login(**client_2_details)

    def test_detail_clientPlot_permitted(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': plot_name}))
        plot = Plot.objects.get(name=plot_name)

        serializer = PlotSerializer(plot)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_otherPlot_forbidden(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': plot_2_name}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_detail_fakePlot_forbidden(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_all_permittedClientPlots(self):
        response = self.client.get(reverse('plot:plot-list'))

        plot = Plot.objects.get(name=plot_name)
        serializer = PlotSerializer(plot)
        self.assertEqual(response.data, [serializer.data])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_newPlot_forbidden(self):
        initial_count = Plot.objects.all().count()

        response = self.client.post(reverse('plot:plot-list'), data={
            'name': 'POST_test',
            'dataset': 'django_staff_dataset_test',
            'plot_type': 'Dash',
            'default_settings': 'test time'
        }, format='json')

        self.assertEqual(Plot.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_goodData_forbidden(self):
        response = self.client.put(reverse('plot:plot-detail', kwargs={'name': 'plot1'}), data={
            'name': 'PUT_test',
            'dataset': 'django_staff_dataset_test',
            'plot_type': 'Geographical',
            'default_settings': 'new settings applied'
        }, format='json')

        self.assertTrue(Plot.objects.filter(name='PUT_test').count() == 0)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(AXES_ENABLED=False)
class StaffPlotTest(PlotSetupMixin, PlotTearDownMixin, TestCase):
    def setUp(self):
        super(StaffPlotTest, self).setUp()

        self.client = APIClient()
        self.client.login(**staff_details)

    def test_detail_clientPlot_permitted(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': plot_name}))
        plot = Plot.objects.get(name=plot_name)

        serializer = PlotSerializer(plot)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_otherPlot_permitted(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': plot_2_name}))
        plot = Plot.objects.get(name=plot_2_name)

        serializer = PlotSerializer(plot)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_fakePlot_notFound(self):
        response = self.client.get(reverse('plot:plot-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_all_permitted(self):
        response = self.client.get(reverse('plot:plot-list'))

        plot = Plot.objects.all()
        self.assertEqual(plot.count(), 2)

        serializer = PlotSerializer(plot, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_newPlot_created(self):
        initial_plot_count = Plot.objects.all().count()
        initial_dataset_count = Dataset.objects.all().count()

        response = self.client.post(reverse('plot:plot-list'), data={
            'name': 'POST_test',
            'dataset': client_dataset_2_name,
            'plot_type': 'Bar',
            'default_settings': '{"test time":123}'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Plot.objects.get(name='POST_test').dataset.name, client_dataset_2_name)
        self.assertEqual(Plot.objects.all().count(), initial_plot_count + 1)
        self.assertEqual(Dataset.objects.all().count(), initial_dataset_count)

    def test_post_badDataset_badRequest(self):
        initial_count = Plot.objects.all().count()

        response = self.client.post(reverse('plot:plot-list'), data={
            'name': 'POST_test_bad_data',
            'dataset': 'very fake name',
            'plot_type': 'Pie',
            'default_settings': '{"test time":123}'
        }, format='json')

        self.assertEqual(Plot.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_plotNameCollision_badRequest(self):
        response = self.client.post(reverse('plot:plot-list'), data={
            'name': plot_name,
            'dataset': client_dataset_2_name,
            'plot_type': 'Bar',
            'default_settings': '{"test time":123}'
        }, format='json')

        self.assertEqual(Plot.objects.filter(name='plot1').count(), 1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_goodData_permitted(self):
        response = self.client.put(reverse('plot:plot-detail', kwargs={'name': plot_name}), data={
            'name': 'PUT_test',
            'dataset': client_dataset_2_name,
            'plot_type': 'Geographical',
            'default_settings': '{"newsettingsapplied":123}'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Plot.objects.get(name='PUT_test').default_settings, '{"newsettingsapplied":123}')

    def test_patch_goodData_permitted(self):
        initial_count = Plot.objects.all().count()

        response = self.client.patch(reverse('plot:plot-detail', kwargs={'name': plot_name}), data={
            'name': 'PATCH_test',
        }, format='json')

        self.assertTrue(Plot.objects.filter(name='PATCH_test').exists())
        self.assertEqual(Plot.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_badDataset_badRequest(self):
        response = self.client.put(reverse('plot:plot-detail', kwargs={'name': plot_name}), data={
            'name': 'PUT_test',
            'dataset': 'very fake name',
            'plot_type': 'Geographical',
            'default_settings': '{"newsettingsapplied":123}'
        }, format='json')

        self.assertFalse(Plot.objects.filter(name='PUT_test').exists())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_plotNameCollision_badRequest(self):
        response = self.client.put(reverse('plot:plot-detail', kwargs={'name': plot_name}), data={
            'name': plot_2_name,
            'dataset': client_dataset_2_name,
            'plot_type': 'Geographical',
            'default_settings': '{"newsettingsapplied":123}'
        }, format='json')

        self.assertEqual(Plot.objects.filter(name=plot_2_name).count(), 1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_plotNameCollision_badRequest(self):
        response = self.client.patch(reverse('plot:plot-detail', kwargs={'name': plot_name}), data={
            'name': plot_2_name,
        }, format='json')

        self.assertEqual(Plot.objects.filter(name=plot_2_name).count(), 1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
