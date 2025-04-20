from rest_framework import serializers
from .models import *
from ..useraccount.serializers import UserDetailSerializer
from ..game.serializers import *

class AccessGameHistorySerializer(serializers.ModelSerializer):
    game = GameDetailSerializer()
    user = UserDetailSerializer()
    class Meta:
        model = AccessGameHistory
        fields = ['id', 'game', 'user', 'weight', 'created_at', 'updated_at']