from django.db.models import Model, CharField, ForeignKey, CASCADE, TextField
from common.util.validators import clean_json
from dataset.models import Dataset

PLOT_TYPES = ['Bar', 'Stacked Bar', 'Box', 'Geographical', 'Pie', 'Scatter', 'Time Series']
PLOT_TYPE_CHOICES = [(p, p) for p in PLOT_TYPES]


class Plot(Model):
    name = CharField(max_length=105, unique=True)
    dataset = ForeignKey(Dataset, on_delete=CASCADE, related_name='plots')
    plot_type = CharField(max_length=25, choices=PLOT_TYPE_CHOICES, default='1')
    default_settings = TextField(max_length=750, blank=True)

    class Meta:
        verbose_name = 'Plot'

    def clean(self):
        self.default_settings = clean_json(self.default_settings, 'Default settings')

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Plot, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
