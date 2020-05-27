import os

import pandas as pd
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db.models import Model, SlugField, DateTimeField, FileField, TextField
from django.utils import timezone

from common.util.helpers import file_extension, extension_to_csv
from django.conf import settings

TMP_CSV_PATH = os.path.join(settings.MEDIA_ROOT, 'tmp')


def file_path(instance, filename):
    filename, extension = os.path.splitext(filename)
    return f'{instance.name}{extension}'


class Dataset(Model):
    name = SlugField(max_length=50, unique=True, blank=False)
    creation_date = DateTimeField('creation date', default=timezone.now)
    upload_date = DateTimeField('upload date', auto_now_add=True)
    last_modified_date = DateTimeField('last modified date', auto_now=True)
    description = TextField(max_length=500)
    file = FileField(upload_to=file_path, null=True, blank=False,
                     validators=[FileExtensionValidator(['csv', 'xls', 'xlsx'])])

    @staticmethod
    def clean_df(df):
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            df.sort_values('Date', inplace=True)
            df['Year'] = df['Date'].dt.year
            df['Month'] = df['Date'].dt.strftime('%Y-%m')
        return df

    def save(self, *args, **kwargs):
        self.validate_file()
        self.clean_csv()
        self.clean_and_update_if_excel()
        return super(Dataset, self).save(*args, **kwargs)

    def validate_file(self):
        if self.file.name is None:
            raise ValidationError('Upload a .csv, .xlsx or .xls file')

    def clean_csv(self):
        if file_extension(self.file.name) != '.csv':
            return

        df = pd.read_csv(self.file)
        df = Dataset.clean_df(df)
        df.to_csv(TMP_CSV_PATH, index=False)

        self.file.close()
        self.file.file = open(TMP_CSV_PATH, 'rb')

    def clean_and_update_if_excel(self, *args, **kwargs):
        ext = file_extension(self.file.name)
        if not (ext == '.xls' or ext == '.xlsx'):
            return

        with open(TMP_CSV_PATH, 'wb') as f:
            f.write(self.file.read())
        df = pd.read_excel(TMP_CSV_PATH)
        df = Dataset.clean_df(df)
        df.to_csv(TMP_CSV_PATH, index=False)

        self.file.close()
        self.file.file = open(TMP_CSV_PATH, 'rb')
        self.file.name = extension_to_csv(self.file.name)

    def warn_if_mixed_data_types(self, request):
        df = pd.read_csv(self.file)
        if df._is_mixed_type:
            messages.add_message(request, messages.WARNING,
                                 f"Dataset contains mixed data types in the following columns: "
                                 f"{list(df.select_dtypes(include='object').columns)}")

    def __str__(self):
        return self.name
