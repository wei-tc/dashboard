from django.contrib.auth.models import AbstractUser
from django.db.models import ManyToManyField

from dataset.models import Dataset
from plot.models import Plot


class User(AbstractUser):
    dataset = ManyToManyField(Dataset, blank=True)
    plot = ManyToManyField(Plot, blank=True)

    class Meta:
        verbose_name = 'User'

    def __str__(self):
        return self.username
