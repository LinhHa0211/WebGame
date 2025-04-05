from django.utils import timezone
from rest_framework import serializers
from .models import Category, Game, OperatingSystem, CategoryDetail, OperatingSystemDetail, Image, Promotion, PromotionDetail, Order
from apps.useraccount.serializers import UserDetailSerializer
from django.conf import settings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id',
            'title',
            'description',
            'image_url'
        ]
        
class OperatingSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingSystem
        fields = [
            'id',
            'title'
        ]
        
        
class PromotionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionDetail
        fields = ['id', 'discount', 'game', 'promotion']

class PromotionSerializer(serializers.ModelSerializer):
    start_day = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S%z')
    end_day = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S%z')
    class Meta:
        model = Promotion
        fields = ['id', 'title', 'start_day', 'end_day']

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            'id',
            'title',
            'description',
            'price',
            'image_url',
            'publish_year',
        ]
        
class GameDetailSerializer(serializers.ModelSerializer):
    publisher = UserDetailSerializer(read_only=True, many=False)
    
    class Meta:
        model = Game
        fields = [
            'id',
            'title',
            'description',
            'price',
            'publisher',
            'publish_year',
            'image_url'
        ]
        
class CategoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryDetail
        fields = [
            'id',
            'game',
            'category',
        ]
        
class OperatingSystemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingSystemDetail
        fields = [
            'id',
            'game',
            'operating_system',
        ]
        
class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = [
            'id',
            'game',
            'image_url',
        ]
        
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'game',
            'buy_at',
            'total_price',
            'status'
        ]
   
class OrderListSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True, many=False)
    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'game',
            'buy_at',
            'total_price',
            'status'
        ]