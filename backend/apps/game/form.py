from django.forms import ModelForm

from .models import Game


class GameForm(ModelForm):
    class Meta:
        model = Game
        fields = (
            'title',
            'description',
            'price',
            'publish_year',
            'image',
        )