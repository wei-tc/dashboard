from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from common.util.helpers import remove_file
from dataset.models import Dataset
from industry_standard.models import IndustryStandard
from plot.models import Plot

from dataset.models import TMP_CSV_PATH


class ProxyPlot(Plot):
    class Meta:
        proxy = True
        verbose_name = 'Plot'


class ProxyIndustryStandard(IndustryStandard):
    class Meta:
        proxy = True
        verbose_name = 'Industry Standard'


class ProxyDataset(Dataset):
    class Meta:
        proxy = True
        verbose_name = 'Dataset'


@receiver(post_delete, sender=ProxyDataset)
def remove_file_from_s3(sender, instance, **kwargs):
    instance.file.delete(save=False)


@receiver(post_save, sender=ProxyDataset)
def auto_delete_tmp_file_if_any(sender, instance, **kwargs):
    remove_file(TMP_CSV_PATH)
