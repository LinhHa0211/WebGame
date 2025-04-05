from django.utils import timezone
from django.http import Http404, JsonResponse

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from .models import Game, Category, OperatingSystem, CategoryDetail, OperatingSystemDetail, Image, Promotion, PromotionDetail, Order
from .serializers import GameSerializer, CategorySerializer, OperatingSystemSerializer, GameDetailSerializer, ImageSerializer, PromotionDetailSerializer, PromotionSerializer, OrderSerializer, OrderListSerializer
from .form import GameForm

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_list(request):
    games = Game.objects.all()
    # games = Game.objects.filter(approval='APPROVED')
    
    publisher_id = request.GET.get('publisher_id', '')
    if publisher_id:
        games = games.filter(publisher_id=publisher_id)
    
    serializer = GameSerializer(games, many=True)
    
    return JsonResponse({
        'data': serializer.data
    })
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def user_game_list(request, userId):
    try:
        orders = Order.objects.filter(user=userId)
        serializer = OrderListSerializer(orders, many=True)
        return JsonResponse({
            'data': serializer.data
        })
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
    
    return JsonResponse({
        'data': serializer.data
    })
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])

def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    
    return JsonResponse({
        'data': serializer.data
    })
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def category_game_list(request, gameId):
    try:
        # Retrieve the Game object
        game = Game.objects.get(id=gameId)
        
        # Get all CategoryDetail objects related to the game
        category_details = CategoryDetail.objects.filter(game=game)
        
        if not category_details.exists():
            return JsonResponse({'data': []}, status=200)
        
        # Get all related categories
        category_ids = category_details.values_list('category__id', flat=True)
        categories = Category.objects.filter(id__in=category_ids)
        
        if not categories.exists():
            return JsonResponse({'data': []}, status=200)
        
        # Serialize the categories
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
    
    return JsonResponse({
        'data': serializer.data
    })
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def operatingSystem_game_list(request, gameId):
    try:
        # Retrieve the Game object
        game = Game.objects.get(id=gameId)
        
        # Get all OperatingSystemDetail objects related to the game
        operating_system_details = OperatingSystemDetail.objects.filter(game=game)
        
        if not operating_system_details.exists():
            return JsonResponse({'data': []}, status=200)
        
        # Get all related Operating Systems
        operating_system_ids = operating_system_details.values_list('operating_system__id', flat=True)
        operating_systems = OperatingSystem.objects.filter(id__in=operating_system_ids)
        
        if not operating_systems.exists():
            return JsonResponse({'data': []}, status=200)
        
        # Serialize the Operating Systems
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
        # Use get() instead of filter() to retrieve a single Game object
        game = Game.objects.get(id=gameId)
        # Filter images related to this game
        images = Image.objects.filter(game=game)
        serializer = ImageSerializer(images, many=True)
        return JsonResponse({
            'data': serializer.data
        })
    except Game.DoesNotExist:
        # Return a 404 response if the game ID doesn't exist
        raise Http404("Game not found")
    except Exception as e:
        # Handle other potential errors
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_promotion_detail(request, game_id):
    try:
        # Retrieve the Game object
        game = Game.objects.get(id=game_id)
        promotion_detail = PromotionDetail.objects.get(game=game)
        if not promotion_detail:
            return JsonResponse({'data': None}, status=200)
        # Serialize the PromotionDetail
        serializer = PromotionDetailSerializer(promotion_detail)
        return JsonResponse({'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        # Return a 404 response if the game ID doesn't exist
        raise Http404("Game not found")
    except Exception as e:
        # Handle other potential errors
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
        # Serialize the PromotionDetail
        serializer = PromotionSerializer(promotion)
        return JsonResponse({'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        # Return a 404 response if the game ID doesn't exist
        raise Http404("Game not found")
    except Exception as e:
        # Handle other potential errors
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
            # Create a new order if none exists
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
    