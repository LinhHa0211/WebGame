from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import *
from .serializers import *

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def update_access_history(request, userId, gameId):
    try:
        user_id = request.data.get('user_id')
        game_id = request.data.get('game_id')
        if str(user_id) != str(userId) or str(game_id) != str(gameId):
            return JsonResponse({'error': 'Mismatched user_id or game_id'}, status=400)
        game = Game.objects.get(id=gameId)
        user = User.objects.get(id=userId)
        try:
            # Nếu bản ghi đã tồn tại, cập nhật weight và updated_at
            history = AccessGameHistory.objects.get(user=user, game=game)
            history.weight += 1  # Tăng số lần truy cập
            history.save()
        except AccessGameHistory.DoesNotExist:
            # Nếu chưa có, tạo bản ghi mới
            history = AccessGameHistory(user=user, game=game, weight=1)
            history.save()
        # Giữ 10 bản ghi gần nhất
        user_histories = AccessGameHistory.objects.filter(user=user).order_by('-updated_at')
        max_count = 10
        count = user_histories.count()
        if count > max_count:
            ids_to_delete = list(user_histories.values_list('id', flat=True)[max_count:])
            AccessGameHistory.objects.filter(id__in=ids_to_delete).delete()
        # Áp dụng phân rã tuyến tính để điều chỉnh weight
        histories = AccessGameHistory.objects.filter(user=user).order_by('-updated_at')
        if histories.exists():
            max_date = histories.first().updated_at.timestamp()  # Thời gian gần nhất (epoch seconds)
            for history in histories:
                time_diff = max_date - history.updated_at.timestamp()  # Chênh lệch thời gian (seconds)
                time_diff_days = time_diff / (24 * 3600)  # Chuyển sang ngày
                # Áp dụng công thức phân rã tuyến tính
                adjusted_weight = history.weight / (time_diff_days + 1)
                history.weight = max(adjusted_weight, 1.0)  # Đảm bảo weight không nhỏ hơn 1
                history.save()

        serializer = AccessGameHistorySerializer(history)
        return JsonResponse({'success': True, 'history': serializer.data})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        print('Error', e)
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_recommendations(request, userId):
    try:
        user = User.objects.get(id=userId)
        # Bước 1: Lấy lịch sử truy cập của người dùng
        histories = AccessGameHistory.objects.filter(user=user).order_by('-updated_at')[:10]
        if not histories.exists():
            return JsonResponse({'data': []}, status=200)  # Trả về danh sách rỗng nếu không có lịch sử

        # Bước 2: Lấy danh sách tất cả thể loại
        all_categories = Category.objects.all()
        category_ids = [str(category.id) for category in all_categories]
        category_id_to_index = {cat_id: idx for idx, cat_id in enumerate(category_ids)}

        # Bước 3: Xây dựng vector hồ sơ người dùng
        user_profile = np.zeros(len(category_ids))  # Vector hồ sơ ban đầu
        total_weight = 0.0

        for history in histories:
            game = history.game
            weight = history.weight  # Weight đã được điều chỉnh bằng phân rã tuyến tính

            # Lấy các thể loại của game
            category_details = CategoryDetail.objects.filter(game=game)
            game_categories = [str(detail.category.id) for detail in category_details]

            # Tạo vector thể loại cho game
            game_vector = np.zeros(len(category_ids))
            for cat_id in game_categories:
                if cat_id in category_id_to_index:
                    game_vector[category_id_to_index[cat_id]] = 1

            # Cộng dồn vào hồ sơ người dùng với trọng số
            user_profile += game_vector * weight
            total_weight += weight

        # Chuẩn hóa hồ sơ người dùng
        if total_weight > 0:
            user_profile /= total_weight

        # Bước 4: Lấy danh sách đơn hàng của người dùng để lọc game đã mua
        user_orders = Order.objects.filter(user=user, status='PAID')
        purchased_game_ids = set(str(order.game.id) for order in user_orders)

        # Bước 5: Tạo vector thể loại cho tất cả game
        all_games = Game.objects.filter(approval='APPROVED')
        game_vectors = []
        game_ids = []
        accessed_game_ids = set(str(history.game.id) for history in histories)

        for game in all_games:
            if str(game.id) in accessed_game_ids or str(game.id) in purchased_game_ids:
                continue  # Bỏ qua các game đã truy cập hoặc đã mua

            category_details = CategoryDetail.objects.filter(game=game)
            game_categories = [str(detail.category.id) for detail in category_details]

            game_vector = np.zeros(len(category_ids))
            for cat_id in game_categories:
                if cat_id in category_id_to_index:
                    game_vector[category_id_to_index[cat_id]] = 1

            game_vectors.append(game_vector)
            game_ids.append(game.id)

        if not game_vectors:
            return JsonResponse({'data': []}, status=200)  # Không có game nào để gợi ý

        # Bước 6: Tính độ tương đồng
        game_vectors = np.array(game_vectors)
        user_profile = user_profile.reshape(1, -1)  # Reshape để tính cosine similarity
        similarities = cosine_similarity(user_profile, game_vectors)[0]

        # Bước 7: Sắp xếp và lấy top 5 game
        game_similarity_pairs = list(zip(game_ids, similarities))
        game_similarity_pairs.sort(key=lambda x: x[1], reverse=True)  # Sắp xếp giảm dần theo similarity
        top_game_ids = [game_id for game_id, _ in game_similarity_pairs[:5]]  # Lấy top 5

        # Bước 8: Lấy thông tin chi tiết của các game được gợi ý
        recommended_games = Game.objects.filter(id__in=top_game_ids)
        serializer = GameDetailSerializer(recommended_games, many=True)

        return JsonResponse({'data': serializer.data}, status=200)

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        print('Error', e)
        return JsonResponse({'error': str(e)}, status=500)