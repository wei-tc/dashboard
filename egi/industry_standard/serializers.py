import re

from rest_framework.serializers import ModelSerializer, ValidationError

from .models import IndustryStandard


class IndustryStandardSerializer(ModelSerializer):
	class Meta:
		model = IndustryStandard
		fields = ('name', 'standard')
	

	def validate(self, data):
		if(data['standard']):
			standard = data['standard']
			standard = standard.split(',')
			for s in standard:
				if(re.search("[A-Z]+[a-z]*[0-9]*':[0-9]+\.*[0-9]*",s) == None):
					raise ValidationError("'" + s + "' is in the wrong format for an industry standard entry");
		return data

	def update(self, instance, validated_data):
		instance.name = validated_data.get('name', instance.name)
		instance.standard = validated_data.get('standard', instance.standard)
		instance.save()
		
		return instance
		


	
