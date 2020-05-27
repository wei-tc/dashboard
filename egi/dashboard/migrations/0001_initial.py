# Generated by Django 2.2.6 on 2019-11-16 14:48

from django.db import migrations


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('plot', '0001_initial'),
        ('industry_standard', '0001_initial'),
        ('dataset', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProxyDataset',
            fields=[
            ],
            options={
                'verbose_name': 'Dataset',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('dataset.dataset',),
        ),
        migrations.CreateModel(
            name='ProxyIndustryStandard',
            fields=[
            ],
            options={
                'verbose_name': 'Industry Standard',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('industry_standard.industrystandard',),
        ),
        migrations.CreateModel(
            name='ProxyPlot',
            fields=[
            ],
            options={
                'verbose_name': 'Plot',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('plot.plot',),
        ),
    ]
