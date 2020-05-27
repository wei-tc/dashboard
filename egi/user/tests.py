import os
import fnmatch
from collections import OrderedDict

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.models import Q
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from dataset.models import Dataset
from plot.models import Plot
from .models import User
from .serializers import UserSerializer

client_dataset_name = 'django_client_dataset_test'
client_dataset_2_name = 'django_staff_dataset_test'

client_details = {'username': 'client', 'password': '1234'}
client_2_details = {'username': 'client2', 'password': '1234'}
staff_details = {'username': 'staff', 'password': '1234'}
staff_2_details = {'username': 'staff2', 'password': '1234'}

dash_app_name = 'dash'
plot_name = 'plot1'
plot_2_name = 'plot2'


class UserSetupMixin(object):
    def setUp(self):
        self.create_initial_data()
        super(UserSetupMixin, self).setUp()

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

        plot = Plot.objects.create(name=plot_name, dataset=client_dataset, plot_type='Box')
        plot_2 = Plot.objects.create(name=plot_2_name, dataset=client_dataset_2, plot_type='Bar')

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


class UserTearDownMixin(object):
    def tearDown(self):
        for file in os.listdir(settings.MEDIA_ROOT):
            if(
                fnmatch.fnmatch(file, f'{client_dataset_name}*.csv') or
                fnmatch.fnmatch(file, f'{client_dataset_2_name}*.csv') or
                fnmatch.fnmatch(file, f'POST_test*.csv') or
                fnmatch.fnmatch(file, f'PUT_test*.csv')
            ):
                os.remove(os.path.join(settings.MEDIA_ROOT, file))

        super(UserTearDownMixin, self).tearDown()


@override_settings(AXES_ENABLED=False)
class UserSerializerTest(UserSetupMixin, UserTearDownMixin, TestCase):
    def setUp(self):
        super(UserSerializerTest, self).setUp()
        self.client = APIClient()
        self.client.login(**staff_details)

    def test_serialize_all_ok(self):
        users = User.objects.all()
        self.assertEqual(users.count(), 4)

        serializer = UserSerializer(users, many=True)

        self.assertEqual(serializer.data,
                         [OrderedDict([('username', 'client'), ('is_staff', False),
                                       ('dataset', ['django_client_dataset_test', 'django_staff_dataset_test']),
                                       ('plot', [OrderedDict([('name', 'plot2'),
                                                              ('dataset', 'django_staff_dataset_test'),
                                                              ('plot_type', 'Bar'),
                                                              ('default_settings', '')])])]),
                          OrderedDict([('username', 'client2'), ('is_staff', False),
                                       ('dataset', ['django_staff_dataset_test']),
                                       ('plot', [OrderedDict([('name', 'plot1'),
                                                              ('dataset', 'django_client_dataset_test'),
                                                              ('plot_type', 'Box'),
                                                              ('default_settings',
                                                               '')])])]),
                          OrderedDict([('username', 'staff'), ('is_staff', True),
                                       ('dataset', []),
                                       ('plot', [])]),
                          OrderedDict([('username', 'staff2'), ('is_staff', True),
                                       ('dataset', ['django_client_dataset_test']),
                                       ('plot', [OrderedDict([('name', 'plot1'),
                                                              ('dataset', 'django_client_dataset_test'),
                                                              ('plot_type', 'Box'),
                                                              ('default_settings', '')])])])]
                         )

@override_settings(AXES_ENABLED=False)
class AnonUserTest(UserSetupMixin, UserTearDownMixin, TestCase):
    def setUp(self):
        super(AnonUserTest, self).setUp()

        self.client = APIClient()

    def test_detail_realUser_forbidden(self):
        response = self.client.get(
            reverse('user:permission-detail', kwargs={'username': client_details['username']}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_fakeUser_forbidden(self):
        response = self.client.get(reverse('user:permission-detail', kwargs={'username': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_all_permittedEmpty(self):
        response = self.client.get(reverse('user:permission-list'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

@override_settings(AXES_ENABLED=False)
class ClientUserTest(UserSetupMixin, UserTearDownMixin, TestCase):
    def setUp(self):
        super(ClientUserTest, self).setUp()

        self.client = APIClient()
        self.client.login(**client_details)

    def test_detail_self_permitted(self):
        response = self.client.get(
            reverse('user:permission-detail', kwargs={'username': client_details['username']}))
        user = User.objects.get(username=client_details['username'])

        serializer = UserSerializer(user)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_otherUser_forbidden(self):
        response = self.client.get(
            reverse('user:permission-detail', kwargs={'username': client_2_details['username']}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_staffUser_forbidden(self):
        response = self.client.get(
            reverse('user:permission-detail', kwargs={'username': staff_details['username']}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_fakeUser_forbidden(self):
        response = self.client.get(reverse('user:permission-detail', kwargs={'username': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_all_permittedSelf(self):
        response = self.client.get(reverse('user:permission-list'))

        user = User.objects.get(username=client_details['username'])
        serializer = UserSerializer(user)
        self.assertEqual(response.data, [serializer.data])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

@override_settings(AXES_ENABLED=False)
class StaffUserTest(UserSetupMixin, UserTearDownMixin, TestCase):
    def setUp(self):
        super(StaffUserTest, self).setUp()

        self.client = APIClient()
        self.client.login(**staff_details)

    def test_detail_clientUser_permitted(self):
        response = self.client.get(
            reverse('user:permission-detail', kwargs={'username': client_details['username']}))
        user = User.objects.get(username=client_details['username'])

        serializer = UserSerializer(user)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_staffUser_permitted(self):
        response = self.client.get(
            reverse('user:permission-detail', kwargs={'username': staff_2_details['username']}))
        user = User.objects.get(username=staff_2_details['username'])

        serializer = UserSerializer(user)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_fakeUser_notFound(self):
        response = self.client.get(reverse('user:permission-detail', kwargs={'username': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_all_permitted(self):
        response = self.client.get(reverse('user:permission-list'))

        user = User.objects.all()
        self.assertEqual(user.count(), 4)

        serializer = UserSerializer(user, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_plot_permitted(self):
        response = self.client.patch(
            reverse('user:permission-detail', kwargs={'username': staff_2_details['username']}),
            data={
                'plot': [plot_name, plot_2_name],
            }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(Q(username=staff_2_details['username']),
                                            Q(plot__name=plot_2_name)).exists())
        self.assertTrue(User.objects.filter(Q(username=staff_2_details['username']),
                                            Q(plot__name=plot_name)).exists())
        self.assertEqual(User.objects.get(username=staff_2_details['username']).plot.count(), 2)

        response = self.client.patch(
            reverse('user:permission-detail', kwargs={'username': staff_2_details['username']}),
            data={
                'plot': [plot_name],
            }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(username=staff_2_details['username']).plot.count(), 1)

