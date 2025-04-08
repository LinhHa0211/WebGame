import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

application = get_asgi_application()

from apps.chat import routing
from apps.chat.token_auth import TokenAuthMiddleware

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': TokenAuthMiddleware(
        URLRouter(
            routing.websocket_urlpatterns
        )
    )
})