from django.urls import path
from . import api

urlpatterns = [
    path('', api.game_list, name='api_game_list'),
    path('category/', api.category_list, name='api_category_list'),
    path('category/<uuid:gameId>/', api.category_game_list, name='api_category_game_list'),
    path('operatingSystem/', api.operatingSystem_list, name='api_operatingSystem_list'),
    path('operatingSystem/<uuid:gameId>/', api.operatingSystem_game_list, name='api_operatingSystem_game_list'),
    path('create/', api.create_game, name='api_create_game'),
    path('create/add_category/<uuid:game_id>/<uuid:category_id>/', api.add_categories_to_game, name='api_add_categories_to_game'),
    path('create/add_operating_system/<uuid:game_id>/<uuid:operating_system_id>/', api.add_operating_systems_to_game, name='api_add_operating_systems_to_game'),
    path('<uuid:pk>/', api.game_detail, name='api_game_detail'),
    path('image/<uuid:gameId>/', api.image_list, name='api_image_list'),
    path('promotion_detail/<uuid:game_id>/', api.game_promotion_detail, name='game_promotion_detail'),
    path('promotion/<uuid:game_id>/', api.game_promotion, name='game_promotion'),
    path('<uuid:userId>/order/', api.user_game_list, name='api_user_game_list'),
    path('order/<uuid:game_id>/', api.order_game, name='api_game_order'),
    path('<uuid:gameId>/toggle_favorite/', api.toggle_favorite, name='api_toggle_favorite'),
    path('<uuid:game_id>/ratings/', api.game_ratings, name='api_game_ratings'),
    path('<uuid:game_id>/rate/', api.rate_game, name='api_rate_game'),
]