from rest_framework import serializers
from .models import Game, Category, OperatingSystem, Image, Promotion, PromotionDetail, Order, Rating
from ..useraccount.serializers import UserDetailSerializer

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'image_url', 'price']

class RatingSerializer(serializers.ModelSerializer):
    user = UserDetailSerializer()
    class Meta:
        model = Rating
        fields = ['id', 'user', 'rating', 'comment', 'created_at', 'updated_at']
class GameDetailSerializer(serializers.ModelSerializer):
    ratings = RatingSerializer(many=True, read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    purchase_count = serializers.SerializerMethodField()
    publisher = UserDetailSerializer()
    class Meta:
        model = Game
        fields = ['id', 'title', 'description', 'price', 'publisher', 'image_url', 'publish_year', 'avg_rating', 'ratings', 'purchase_count']
    
    def get_purchase_count(self, obj):
        return obj.get_purchase_count()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'description', 'image_url']

class OperatingSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingSystem
        fields = ['id', 'title']

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image_url']

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = ['id', 'title', 'start_day', 'end_day']

class PromotionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionDetail
        fields = ['id', 'discount', 'promotion']

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'user', 'game', 'buy_at', 'total_price', 'status']

class OrderListSerializer(serializers.ModelSerializer):
    game = GameSerializer()
    class Meta:
        model = Order
        fields = ['id', 'game', 'buy_at', 'total_price', 'status']

