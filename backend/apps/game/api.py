from django.utils import timezone
from django.http import Http404, JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Game, Category, OperatingSystem, CategoryDetail, OperatingSystemDetail, Image, Promotion, PromotionDetail, Order, Rating
from .serializers import GameSerializer, CategorySerializer, OperatingSystemSerializer, GameDetailSerializer, ImageSerializer, PromotionDetailSerializer, PromotionSerializer, OrderSerializer, OrderListSerializer, RatingSerializer
from .form import GameForm

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_list(request):
    games = Game.objects.all()
    publisher_id = request.GET.get('publisher_id', '')
    if publisher_id:
        games = games.filter(publisher_id=publisher_id)
    serializer = GameSerializer(games, many=True)
    return JsonResponse({'data': serializer.data})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def user_game_list(request, userId):
    try:
        orders = Order.objects.filter(user=userId)
        serializer = OrderListSerializer(orders, many=True)
        return JsonResponse({'data': serializer.data})
    except Exception as e:
        print("Error fetching user orders:", e)
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_detail(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    serializer = GameDetailSerializer(game)
    return JsonResponse({'data': serializer.data})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return JsonResponse({'data': serializer.data})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def category_game_list(request, gameId):
    try:
        game = Game.objects.get(id=gameId)
        category_details = CategoryDetail.objects.filter(game=game)
        if not category_details.exists():
            return JsonResponse({'data': []}, status=200)
        category_ids = category_details.values_list('category__id', flat=True)
        categories = Category.objects.filter(id__in=category_ids)
        if not categories.exists():
            return JsonResponse({'data': []}, status=200)
        serializer = CategorySerializer(categories, many=True)
        return JsonResponse({'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        raise Http404("Game not found")
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def operatingSystem_list(request):
    categories = OperatingSystem.objects.all()
    serializer = OperatingSystemSerializer(categories, many=True)
    return JsonResponse({'data': serializer.data})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def operatingSystem_game_list(request, gameId):
    try:
        game = Game.objects.get(id=gameId)
        operating_system_details = OperatingSystemDetail.objects.filter(game=game)
        if not operating_system_details.exists():
            return JsonResponse({'data': []}, status=200)
        operating_system_ids = operating_system_details.values_list('operating_system__id', flat=True)
        operating_systems = OperatingSystem.objects.filter(id__in=operating_system_ids)
        if not operating_systems.exists():
            return JsonResponse({'data': []}, status=200)
        serializer = OperatingSystemSerializer(operating_systems, many=True)
        return JsonResponse({'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        raise Http404("Game not found")
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def image_list(request, gameId):
    try:
        game = Game.objects.get(id=gameId)
        images = Image.objects.filter(game=game)
        serializer = ImageSerializer(images, many=True)
        return JsonResponse({'data': serializer.data})
    except Game.DoesNotExist:
        raise Http404("Game not found")
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_promotion_detail(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        promotion_detail = PromotionDetail.objects.get(game=game)
        if not promotion_detail:
            return JsonResponse({'data': None}, status=200)
        serializer = PromotionDetailSerializer(promotion_detail)
        return JsonResponse({'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        raise Http404("Game not found")
    except Exception as e:
        return JsonResponse({'data': None})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_promotion(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        promotion_detail = PromotionDetail.objects.get(game=game)
        promotion = Promotion.objects.get(id=promotion_detail.promotion.id)
        if not promotion:
            return JsonResponse({'data': None}, status=200)
        serializer = PromotionSerializer(promotion)
        return JsonResponse({'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        raise Http404("Game not found")
    except Exception as e:
        return JsonResponse({'data': None})

@api_view(['POST'])
def create_game(request):
    form = GameForm(request.POST, request.FILES)
    if form.is_valid():
        game = form.save(commit=False)
        game.publisher = request.user
        game.save()
        return JsonResponse({'success': True, 'game_id': str(game.id)})
    else:
        return JsonResponse({'errors': form.errors}, status=400)

@api_view(['POST'])
def add_categories_to_game(request, game_id, category_id):
    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)
    try:
        CategoryDetail.objects.create(game=game, category=category)
    except Exception as e:
        return JsonResponse({'error': f'Error associating category {category_id} with game {game_id}: {str(e)}'}, status=400)
    return JsonResponse({'success': True})

@api_view(['POST'])
def add_operating_systems_to_game(request, game_id, operating_system_id):
    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    try:
        operating_system = OperatingSystem.objects.get(id=operating_system_id)
    except OperatingSystem.DoesNotExist:
        return JsonResponse({'error': 'Operating System not found'}, status=404)
    try:
        OperatingSystemDetail.objects.create(game=game, operating_system=operating_system)
    except Exception as e:
        return JsonResponse({'error': f'Error associating operating_system {operating_system_id} with game {game_id}: {str(e)}'}, status=400)
    return JsonResponse({'success': True})

@api_view(['POST'])
def order_game(request, game_id):
    try:
        total_price = request.POST.get('total_price')
        if not total_price:
            return JsonResponse({'error': 'total_price is required'}, status=400)
        total_price = float(total_price)
        game = Game.objects.get(id=game_id)
        try:
            order = Order.objects.get(user=request.user, game=game)
            if order.status == 'PAID':
                return JsonResponse({'error': 'You have already bought this game'}, status=400)
            elif order.status == 'PROCESSING':
                return JsonResponse({'error': 'You have already bought this game and it is processing for a refund'}, status=400)
            else:
                order.status = 'PAID'
                order.save()
                serializer = OrderSerializer(order)
                return JsonResponse({'success': True, 'order': serializer.data})
        except Order.DoesNotExist:
            order = Order(
                user=request.user,
                game=game,
                total_price=total_price,
                status='PAID'
            )
            order.save()
            serializer = OrderSerializer(order)
            return JsonResponse({'success': True, 'order': serializer.data})
    except Exception as e:
        print('Error', e)
        return JsonResponse({'success': False})

@api_view(['POST'])
def toggle_favorite(request, gameId):
    try:
        game = Game.objects.get(id=gameId)
        try:
            order = Order.objects.get(user=request.user, game=game)
            if order.status != 'WL':
                return JsonResponse(
                    {'non_field_errors': ['You have already bought this game']},
                    status=400
                )
            else:
                order.delete()
                return JsonResponse({
                    'success': True,
                    'is_favorited': False
                }, status=200)
        except Order.DoesNotExist:
            order = Order(
                user=request.user,
                game=game,
                total_price=0,
                status='WL'
            )
            order.save()
            serializer = OrderSerializer(order)
            return JsonResponse({
                'success': True,
                'is_favorited': True,
                'order': serializer.data
            }, status=201)
    except Game.DoesNotExist:
        return JsonResponse(
            {'non_field_errors': ['Game not found']},
            status=404
        )
    except Exception as e:
        return JsonResponse(
            {'non_field_errors': [f'Error: {str(e)}']},
            status=500
        )

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_ratings(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        ratings = Rating.objects.filter(game=game)
        serializer = RatingSerializer(ratings, many=True)
        return JsonResponse({'data': serializer.data})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_game(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        user = request.user
        try:
            order = Order.objects.get(user=user, game=game, status='PAID')
        except Order.DoesNotExist:
            return JsonResponse({'error': 'You must purchase the game to rate it'}, status=403)

        data = request.data
        rating_value = data.get('rating')
        comment = data.get('comment', '')

        # Validate rating
        if not rating_value:
            return JsonResponse({'error': 'Rating is required'}, status=400)
        try:
            rating_value = int(rating_value)
            if rating_value < 1 or rating_value > 5:
                return JsonResponse({'error': 'Rating must be between 1 and 5'}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Rating must be an integer'}, status=400)

        # Check if the user has already rated the game
        try:
            existing_rating = Rating.objects.get(user=user, game=game)
            existing_rating.delete()  # Delete the old rating
        except Rating.DoesNotExist:
            pass  # No existing rating, proceed to create a new one

        # Create new rating
        rating = Rating.objects.create(
            user=user,
            game=game,
            rating=rating_value,
            comment=comment if comment else None
        )
        serializer = RatingSerializer(rating)
        return JsonResponse({'success': True, 'data': serializer.data})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)