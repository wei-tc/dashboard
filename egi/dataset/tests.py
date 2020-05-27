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
from dataset.serializers import DatasetSerializer
from plot.models import Plot

client_dataset_name = 'django_client_dataset_test'
client_dataset_2_name = 'django_client_2_dataset_test'
staff_dataset_name = 'django_staff_dataset_test'

client_details = {'username': 'client', 'password': '1234'}
client_2_details = {'username': 'client2', 'password': '1234'}
staff_details = {'username': 'staff', 'password': '1234'}
staff_2_details = {'username': 'staff2', 'password': '1234'}

plot_name = 'plot1'
plot_2_name = 'plot2'


class DatasetSetupMixin(object):
    def setUp(self):
        self.create_initial_data()
        super(DatasetSetupMixin, self).setUp()

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

        staff_dataset = Dataset.objects.create(
            name=staff_dataset_name,
            creation_date=timezone.now(),
            description=staff_dataset_name,
            file=SimpleUploadedFile(
                name='test.csv',
                content=open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb').read(),
                content_type='text/csv')
        )

        plot = Plot.objects.create(name=plot_name, dataset=client_dataset, plot_type='Box')
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
        staff_2.dataset.add(staff_dataset)


class DatasetTearDownMixin(object):
    def tearDown(self):
        for file in os.listdir(settings.MEDIA_ROOT):
            if(
                fnmatch.fnmatch(file, f'{client_dataset_name}*.csv') or
                fnmatch.fnmatch(file, f'{client_dataset_2_name}*.csv') or
                fnmatch.fnmatch(file, f'{staff_dataset_name}*.csv') or
                fnmatch.fnmatch(file, f'POST_test*.csv') or
                fnmatch.fnmatch(file, f'PUT_test*.csv')
            ):
                os.remove(os.path.join(settings.MEDIA_ROOT, file))

        super(DatasetTearDownMixin, self).tearDown()


@override_settings(AXES_ENABLED=False)
class DatasetSerializerTest(DatasetSetupMixin, DatasetTearDownMixin, TestCase):
    def setUp(self):
        super(DatasetSerializerTest, self).setUp()

        self.client = APIClient()
        self.client.login(**staff_details)

    def test_serialize_all_ok(self):
        datasets = Dataset.objects.all()
        self.assertEqual(datasets.count(), 3)

        serializer = DatasetSerializer(datasets, many=True)
        self.assertEqual(serializer.data,
                         [
                             OrderedDict([('name', 'django_client_dataset_test'),
                                          ('description', 'django_client_dataset_test')]),
                             OrderedDict([('name', 'django_client_2_dataset_test'),
                                          ('description', 'django_client_2_dataset_test')]),
                             OrderedDict([('name', 'django_staff_dataset_test'),
                                          ('description', 'django_staff_dataset_test')])]
                         )


@override_settings(AXES_ENABLED=False)
class AnonDatasetTest(DatasetSetupMixin, DatasetTearDownMixin, TestCase):
    def setUp(self):
        super(AnonDatasetTest, self).setUp()

        self.client = APIClient()

    def test_detail_clientDataset_forbidden(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_fakeDataset_forbidden(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_all_forbidden(self):
        response = self.client.get(reverse('dataset:dataset-list'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_goodData_forbidden(self):
        initial_count = Dataset.objects.all().count()

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.post(reverse('dataset:dataset-list'), data={
                'name': 'POST_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        self.assertEqual(Dataset.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, 403)

    def test_put_goodData_forbidden(self):
        dataset_before = Dataset.objects.get(id=1)
        url = reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name})

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.put(url, data={
                'name': 'PUT_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        dataset_after = Dataset.objects.get(id=1)
        self.assertEqual(dataset_after.name, dataset_before.name)
        self.assertEqual(response.status_code, 403)


@override_settings(AXES_ENABLED=False)
class ClientDatasetTest(DatasetSetupMixin, DatasetTearDownMixin, TestCase):
    def setUp(self):
        super(ClientDatasetTest, self).setUp()

        self.client = APIClient()
        self.client.login(**client_details)

    def test_detail_clientDataset_permitted(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name}))
        dataset = Dataset.objects.get(name=client_dataset_name)

        with open(dataset.file.path, 'r') as f:
            self.assertEqual(response.content.decode('utf-8'), f.read())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_otherDataset_forbidden(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': staff_dataset_name}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_fakeDataset_forbidden(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_all_permittedClientDatasets(self):
        response = self.client.get(reverse('dataset:dataset-list'))

        datasets = Dataset.objects.filter(plots__user__username=client_details['username']) \
            .union(Dataset.objects.filter(user__username=client_details['username']))
        self.assertEqual(datasets.count(), 2)

        serializer = DatasetSerializer(datasets, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_goodData_forbidden(self):
        initial_count = Dataset.objects.all().count()

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.post(reverse('dataset:dataset-list'), data={
                'name': 'POST_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        self.assertEqual(Dataset.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_goodData_forbidden(self):
        dataset_before = Dataset.objects.get(id=1)
        url = reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name})

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.put(url, data={
                'name': 'PUT_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        dataset_after = Dataset.objects.get(id=1)
        self.assertEqual(dataset_after.name, dataset_before.name)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(AXES_ENABLED=False)
class StaffDatasetTest(DatasetSetupMixin, DatasetTearDownMixin, TestCase):
    def setUp(self):
        super(StaffDatasetTest, self).setUp()

        self.client = APIClient()
        self.client.login(**staff_details)

    def test_detail_clientDataset_permitted(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name}))
        dataset = Dataset.objects.get(name=client_dataset_name)

        with open(dataset.file.path, 'r') as f:
            self.assertEqual(response.content.decode('utf-8'), f.read())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_staffDataset_permitted(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': staff_dataset_name}))
        dataset = Dataset.objects.get(name=staff_dataset_name)

        with open(dataset.file.path, 'r') as f:
            self.assertEqual(response.content.decode('utf-8'), f.read())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_fakeDataset_notFound(self):
        response = self.client.get(reverse('dataset:dataset-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_all_permitted(self):
        response = self.client.get(reverse('dataset:dataset-list'))

        datasets = Dataset.objects.all()
        self.assertEqual(datasets.count(), 3)

        serializer = DatasetSerializer(datasets, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_goodData_forbidden(self):
        initial_count = Dataset.objects.all().count()

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.post(reverse('dataset:dataset-list'), data={
                'name': 'POST_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        self.assertEqual(Dataset.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_nameCollision_forbidden(self):
        initial_count = Dataset.objects.all().count()

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.post(reverse('dataset:dataset-list'), data={
                'name': client_dataset_name,
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        self.assertEqual(Dataset.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_badFileType_forbidden(self):
        initial_count = Dataset.objects.all().count()

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.post(reverse('dataset:dataset-list'), data={
                'name': 'POST_test2',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        self.assertEqual(Dataset.objects.all().count(), initial_count)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_goodData_forbidden(self):
        dataset_before = Dataset.objects.get(id=1)
        url = reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name})

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.put(url, data={
                'name': 'PUT_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        dataset_after = Dataset.objects.get(id=1)
        self.assertEqual(dataset_after.name, dataset_before.name)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_nameCollision_forbidden(self):
        dataset_before = Dataset.objects.get(id=1)
        url = reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name})

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.put(url, data={
                'name': staff_dataset_name,
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        dataset_after = Dataset.objects.get(id=1)
        self.assertEqual(dataset_after.name, dataset_before.name)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_badFileType_forbidden(self):
        dataset_before = Dataset.objects.get(id=1)
        url = reverse('dataset:dataset-detail', kwargs={'name': client_dataset_name})

        with open(os.path.join(settings.MEDIA_ROOT, 'test.csv'), 'rb') as file:
            response = self.client.put(url, data={
                'name': 'PUT_test',
                'description': 'testDescription',
                'file': file
            }, format='multipart')

        dataset_after = Dataset.objects.get(id=1)
        self.assertEqual(dataset_after.name, dataset_before.name)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
