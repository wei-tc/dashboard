from django.db.models import Model, CharField, TextField, SlugField

from common.util.validators import aggressive_clean_json


class IndustryStandard(Model):
    name = SlugField(max_length=50, unique=True, blank=False)
    standard = TextField(max_length=1500)

    def clean(self):
        self.standard = aggressive_clean_json(self.standard, 'Standard')

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(IndustryStandard, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
