from rest_framework import serializers

from . models import User

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'avatar_url',
            'is_active',
            'role'
        ]