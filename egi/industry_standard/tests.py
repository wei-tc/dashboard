from collections import OrderedDict

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from .models import IndustryStandard
from .serializers import IndustryStandardSerializer

client_details = {'username': 'client', 'password': '1234'}
staff_details = {'username': 'staff', 'password': '1234'}
ANZECC_Stock = "{'Ca':1000,'SO4':1000,'Al':5.0,'As':0.5,'Cd':0.01,'Cu':0.4,'Pb':0.1,'Hg':0.002,'Mo':0.15,'Se':0.02,'Ni':1.0,'U':0.2,'Zn':20,'F':2.0,'Co':1.0,'Cr':1.0,'B':5.0}"
CEPA_FW = "{'Ag':0.05,'As':0.05,'Ba':1.0,'B':1.0,'Cd':0.01,'Cr':0.05,'Co':0.001,'Cu':1.0,'K':5.0,'Pb':0.005,'Hg':0.0002,'Mn':0.5,'Ni':1.0,'Se':0.01,'Sn':0.5,'SO4':400.0,'Zn':5.0}"


class IndustryStandardSetupMixin(object):
    def setUp(self):
        self.create_initial_data()
        super(IndustryStandardSetupMixin, self).setUp()

    @classmethod
    def create_initial_data(cls):
        IndustryStandard.objects.create(
            name='ANZECC_Stock',
            standard=ANZECC_Stock,
        )

        IndustryStandard.objects.create(
            name='CEPA_FW',
            standard=CEPA_FW,
        )

        client = get_user_model().objects.create_user(**client_details)
        staff = get_user_model().objects.create_user(is_staff=True, **staff_details)


@override_settings(AXES_ENABLED=False)
class IndustryStandardSerializerTest(IndustryStandardSetupMixin, TestCase):
    def setUp(self):
        super(IndustryStandardSerializerTest, self).setUp()

    def test_serialize_all_ok(self):
        industry_standards = IndustryStandard.objects.all()
        self.assertEqual(industry_standards.count(), 2)

        serializer = IndustryStandardSerializer(industry_standards, many=True)
        self.assertEqual(serializer.data, [
            OrderedDict([('name', 'ANZECC_Stock'), ('standard', ANZECC_Stock.replace("'", '"').replace(' ', ''))]),
            OrderedDict([('name', 'CEPA_FW'), ('standard', CEPA_FW.replace("'", '"').replace(' ', ''))]),
        ])


@override_settings(AXES_ENABLED=False)
class AnonIndustryStandardTest(IndustryStandardSetupMixin, TestCase):
    def setUp(self):
        super(AnonIndustryStandardTest, self).setUp()

        self.client = APIClient()

    def test_list_all_forbidden(self):
        response = self.client.get(reverse('industry_standard:industry_standard-list'))
        industry_standards = IndustryStandard.objects.all()
        serializer = IndustryStandardSerializer(industry_standards, many=True)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_cepafw_forbidden(self):
        response = self.client.get(reverse('industry_standard:industry_standard-detail', kwargs={'name': 'CEPA_FW'}))
        industry_standards = IndustryStandard.objects.get(name='CEPA_FW')
        serializer = IndustryStandardSerializer(industry_standards)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_fakeIndustryStandard_forbidden(self):
        response = self.client.get(reverse('industry_standard:industry_standard-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_goodData_forbidden(self):
        currCount = IndustryStandard.objects.all().count()

        response = self.client.post(reverse('industry_standard:industry_standard-list'), data={
            'name': "POST_test",
            'standard': ANZECC_Stock
        }, format='json')

        self.assertEqual(IndustryStandard.objects.all().count(), currCount)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_goodData_forbidden(self):
        response = self.client.put(
            reverse('industry_standard:industry_standard-detail', kwargs={'name': 'ANZECC_Stock'}), data={
                'name': "PUT_test_anon",
                'standard': CEPA_FW
            }, format='json')

        self.assertFalse(IndustryStandard.objects.filter(name='PUT_test_anon').exists())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(AXES_ENABLED=False)
class ClientIndustryStandardTest(IndustryStandardSetupMixin, TestCase):
    def setUp(self):
        super(ClientIndustryStandardTest, self).setUp()

        self.client = APIClient()
        self.client.login(**client_details)

    def test_list_all_permitted(self):
        response = self.client.get(reverse('industry_standard:industry_standard-list'))
        industry_standards = IndustryStandard.objects.all()
        serializer = IndustryStandardSerializer(industry_standards, many=True)

        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_anzeccstock_permitted(self):
        response = self.client.get(
            reverse('industry_standard:industry_standard-detail', kwargs={'name': 'ANZECC_Stock'}))
        industry_standards = IndustryStandard.objects.get(name='ANZECC_Stock')
        serializer = IndustryStandardSerializer(industry_standards)

        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_fakeIndustryStandard_notFound(self):
        response = self.client.get(reverse('industry_standard:industry_standard-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_goodData_forbidden(self):
        currCount = IndustryStandard.objects.all().count()

        response = self.client.post(reverse('industry_standard:industry_standard-list'), data={
            'name': "POST_test",
            'standard': ANZECC_Stock
        }, format='json')

        # self.assertEqual(IndustryStandard.objects.all().count(), currCount)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_goodData_forbidden(self):
        response = self.client.put(
            reverse('industry_standard:industry_standard-detail', kwargs={'name': 'ANZECC_Stock'}), data={
                'name': "PUT_test_client",
                'standard': CEPA_FW
            }, format='json')

        # self.assertFalse(IndustryStandard.objects.filter(name='PUT_test_client').exists())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(AXES_ENABLED=False)
class StaffIndustryStandardTest(IndustryStandardSetupMixin, TestCase):
    def setUp(self):
        super(StaffIndustryStandardTest, self).setUp()

        self.client = APIClient()
        self.client.login(**staff_details)

    def test_list_all_permitted(self):
        response = self.client.get(reverse('industry_standard:industry_standard-list'))
        industry_standards = IndustryStandard.objects.all()
        serializer = IndustryStandardSerializer(industry_standards, many=True)

        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_cepafw_permitted(self):
        response = self.client.get(reverse('industry_standard:industry_standard-detail', kwargs={'name': 'CEPA_FW'}))
        industry_standards = IndustryStandard.objects.get(name='CEPA_FW')
        serializer = IndustryStandardSerializer(industry_standards)

        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_fakeIndustryStandard_notFound(self):
        response = self.client.get(reverse('industry_standard:industry_standard-detail', kwargs={'name': 'not_real'}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_goodData_created(self):
        currCount = IndustryStandard.objects.all().count()

        response = self.client.post(reverse('industry_standard:industry_standard-list'), data={
            'name': "POST_test",
            'standard': ANZECC_Stock
        }, format='json')

        self.assertEqual(IndustryStandard.objects.all().count(), currCount + 1)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_badStandard_badRequest(self):
        currCount = IndustryStandard.objects.all().count()

        response = self.client.post(reverse('industry_standard:industry_standard-list'), data={
            'name': "POST_test",
            'standard': "this is not following the regex thing"
        }, format='json')

        self.assertEqual(IndustryStandard.objects.all().count(), currCount)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_nameCollision_badRequest(self):
        currCount = IndustryStandard.objects.all().count()

        response = self.client.post(reverse('industry_standard:industry_standard-list'), data={
            'name': "CEPA_FW",
            'standard': CEPA_FW
        }, format='json')

        self.assertEqual(IndustryStandard.objects.all().count(), currCount)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_goodData_permitted(self):
        response = self.client.put(
            reverse('industry_standard:industry_standard-detail', kwargs={'name': 'ANZECC_Stock'}), data={
                'name': "PUT_test",
                'standard': CEPA_FW
            }, format='json')

        self.assertTrue(IndustryStandard.objects.filter(name='PUT_test').exists())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_standardNameCollision_badRequest(self):
        response = self.client.put(
            reverse('industry_standard:industry_standard-detail', kwargs={'name': 'ANZECC_Stock'}), data={
                'name': "CEPA_FW",
                'standard': CEPA_FW
            }, format='json')

        self.assertFalse(IndustryStandard.objects.filter(name='CEPA_FW').count() == 2)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
