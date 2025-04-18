from django.utils import timezone
from django.http import Http404, JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from .form import GameForm

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_list(request):
    games = Game.objects.all()
    publisher_id = request.GET.get('publisher_id', '')
    if publisher_id:
        games = games.filter(publisher_id=publisher_id)
    games = games.filter(approval='APPROVED')
    serializer = GameDetailSerializer(games, many=True)
    return JsonResponse({'data': serializer.data})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def game_list_manage(request):
    games = Game.objects.all()
    publisher_id = request.GET.get('publisher_id', '')
    if publisher_id:
        games = games.filter(publisher_id=publisher_id)
    serializer = GameDetailSerializer(games, many=True)
    return JsonResponse({'data': serializer.data})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def delete_game(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        game.delete()
        return JsonResponse({'success': True})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from django.utils.dateparse import parse_date
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_game(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        game.title = request.POST.get('title', game.title)
        game.description = request.POST.get('description', game.description)
        price_str = request.POST.get('price', game.price)
        try:
            game.price = float(price_str)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Invalid price format'}, status=400)
        game.approval = request.POST.get('approval', game.approval)
        game.approval_description = request.POST.get('approval_description', game.approval_description)
        publish_year_str = request.POST.get('publish_year', None)
        if publish_year_str:
            parsed_date = parse_date(publish_year_str)
            if parsed_date:
                game.publish_year = parsed_date
            else:
                return JsonResponse({'error': 'Invalid publish year format'}, status=400)
        if 'image' in request.FILES:
            game.image = request.FILES['image']
        game.save()

        # Clear and update categories
        category_ids = request.POST.getlist('category_ids[]')
        CategoryDetail.objects.filter(game=game).delete()
        for category_id in category_ids:
            try:
                category = Category.objects.get(id=category_id)
                CategoryDetail.objects.create(game=game, category=category)
            except Category.DoesNotExist:
                logger.warning(f"Category ID {category_id} not found, skipping.")
                continue
            except Exception as e:
                logger.error(f"Error creating CategoryDetail for category {category_id}: {str(e)}")
                return JsonResponse({'error': f'Failed to add category {category_id}: {str(e)}'}, status=400)

        # Clear and update operating systems
        operating_system_ids = request.POST.getlist('operating_system_ids[]')
        OperatingSystemDetail.objects.filter(game=game).delete()
        for os_id in operating_system_ids:
            try:
                operating_system = OperatingSystem.objects.get(id=os_id)
                OperatingSystemDetail.objects.create(game=game, operating_system=operating_system)
            except OperatingSystem.DoesNotExist:
                logger.warning(f"Operating System ID {os_id} not found, skipping.")
                continue
            except Exception as e:
                logger.error(f"Error creating OperatingSystemDetail for OS {os_id}: {str(e)}")
                return JsonResponse({'error': f'Failed to add operating system {os_id}: {str(e)}'}, status=400)

        serializer = GameDetailSerializer(game)
        return JsonResponse({'success': True, 'data': serializer.data}, status=200)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in update_game for game_id {game_id}: {str(e)}")
        return JsonResponse({'error': f'Internal server error: {str(e)}'}, status=500)

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
def publisher_game_list(request, userId):
    try:
        games = Game.objects.filter(publisher=userId)
        serializer = GameListSerializer(games, many=True)
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
    
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def create_category(request):
    try:
        title = request.POST.get('title')
        description = request.POST.get('description')
        if not title or not description:
            return JsonResponse({'error': 'Title and description are required'}, status=400)

        category = Category.objects.create(
            title=title,
            description=description,
        )
        if 'image' in request.FILES:
            category.image = request.FILES['image']
        category.save()

        serializer = CategorySerializer(category)
        return JsonResponse({'success': True, 'data': serializer.data}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
        category.title = request.POST.get('title', category.title)
        category.description = request.POST.get('description', category.description)
        if 'image' in request.FILES:
            category.image = request.FILES['image']
        category.save()
        serializer = CategorySerializer(category)
        return JsonResponse({'success': True, 'data': serializer.data}, status=200)
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def delete_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
        category.delete()
        return JsonResponse({'success': True})
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)
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
    
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def create_operating_system(request):
    try:
        title = request.POST.get('title')
        if not title:
            return JsonResponse({'error': 'Title is required'}, status=400)

        operating_system = OperatingSystem.objects.create(title=title)
        serializer = OperatingSystemSerializer(operating_system)
        return JsonResponse({'success': True, 'data': serializer.data}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_operating_system(request, os_id):
    try:
        operating_system = OperatingSystem.objects.get(id=os_id)
        operating_system.title = request.POST.get('title', operating_system.title)
        operating_system.save()
        serializer = OperatingSystemSerializer(operating_system)
        return JsonResponse({'success': True, 'data': serializer.data}, status=200)
    except OperatingSystem.DoesNotExist:
        return JsonResponse({'error': 'Operating System not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def delete_operating_system(request, os_id):
    try:
        operating_system = OperatingSystem.objects.get(id=os_id)
        operating_system.delete()
        return JsonResponse({'success': True})
    except OperatingSystem.DoesNotExist:
        return JsonResponse({'error': 'Operating System not found'}, status=404)
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
    
# Promotion Endpoints
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def promotion_list(request):
    try:
        promotions = Promotion.objects.all()
        serializer = PromotionSerializer(promotions, many=True)
        return JsonResponse({'data': serializer.data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def promotion_details(request, promotion_id):
    try:
        promotion = Promotion.objects.get(id=promotion_id)
        details = PromotionDetail.objects.filter(promotion=promotion)
        serializer = PromotionDetailSerializer(details, many=True)
        return JsonResponse({'data': serializer.data})
    except Promotion.DoesNotExist:
        return JsonResponse({'error': 'Promotion not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def create_promotion(request):
    try:
        title = request.POST.get('title')
        end_day = request.POST.get('end_day')
        game_ids = request.POST.getlist('game_ids[]')  # Expecting a list of game IDs
        discounts = request.POST.getlist('discounts[]')  # Expecting a list of discounts

        if not title or not end_day:
            return JsonResponse({'error': 'Title and end day are required'}, status=400)
        if not game_ids or not discounts or len(game_ids) != len(discounts):
            return JsonResponse({'error': 'Game IDs and discounts must be provided and match in length'}, status=400)

        # Create the Promotion
        promotion = Promotion.objects.create(
            title=title,
            end_day=end_day,
        )

        # Validate and create PromotionDetail entries
        for game_id, discount in zip(game_ids, discounts):
            try:
                game = Game.objects.get(id=game_id)
                discount_value = float(discount)
                if discount_value <= 0 or discount_value > 100:
                    return JsonResponse({'error': f'Invalid discount for game {game_id}: must be between 0 and 100'}, status=400)
                PromotionDetail.objects.create(
                    promotion=promotion,
                    game=game,
                    discount=discount_value,
                )
            except Game.DoesNotExist:
                return JsonResponse({'error': f'Game not found: {game_id}'}, status=404)
            except ValueError:
                return JsonResponse({'error': f'Invalid discount value for game {game_id}'}, status=400)

        serializer = PromotionSerializer(promotion)
        return JsonResponse({'success': True, 'data': serializer.data}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_promotion(request, promotion_id):
    try:
        promotion = Promotion.objects.get(id=promotion_id)
        promotion.title = request.POST.get('title', promotion.title)
        promotion.end_day = request.POST.get('end_day', promotion.end_day)
        promotion.save()

        game_ids = request.POST.getlist('game_ids[]')
        discounts = request.POST.getlist('discounts[]')

        if game_ids and discounts and len(game_ids) == len(discounts):
            # Delete existing PromotionDetails and create new ones
            PromotionDetail.objects.filter(promotion=promotion).delete()
            for game_id, discount in zip(game_ids, discounts):
                try:
                    game = Game.objects.get(id=game_id)
                    discount_value = float(discount)
                    if discount_value <= 0 or discount_value > 100:
                        return JsonResponse({'error': f'Invalid discount for game {game_id}: must be between 0 and 100'}, status=400)
                    PromotionDetail.objects.create(
                        promotion=promotion,
                        game=game,
                        discount=discount_value,
                    )
                except Game.DoesNotExist:
                    return JsonResponse({'error': f'Game not found: {game_id}'}, status=404)
                except ValueError:
                    return JsonResponse({'error': f'Invalid discount value for game {game_id}'}, status=400)

        serializer = PromotionSerializer(promotion)
        return JsonResponse({'success': True, 'data': serializer.data}, status=200)
    except Promotion.DoesNotExist:
        return JsonResponse({'error': 'Promotion not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def delete_promotion(request, promotion_id):
    try:
        promotion = Promotion.objects.get(id=promotion_id)
        promotion.delete()
        return JsonResponse({'success': True})
    except Promotion.DoesNotExist:
        return JsonResponse({'error': 'Promotion not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def order_list(request):
    try:
        orders = Order.objects.all()
        serializer = OrderListSerializer(orders, many=True)
        return JsonResponse({'data': serializer.data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order.total_price = float(request.POST.get('total_price', order.total_price))
        order.status = request.POST.get('status', order.status)
        order.refund_description = request.POST.get('refund_description', order.refund_description)
        order.save()
        serializer = OrderListSerializer(order)
        return JsonResponse({'success': True, 'data': serializer.data}, status=200)
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except ValueError:
        return JsonResponse({'error': 'Invalid total price'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def delete_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order.delete()
        return JsonResponse({'success': True})
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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