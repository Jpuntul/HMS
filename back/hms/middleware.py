"""Custom middleware.

ContentSecurityPolicyMiddleware: Django only serves HTML for two surfaces -
the admin panel and DRF's browsable API. The React SPA is a separate static
deployment (Cloudflare Pages) and needs its own CSP configured at that host;
see front/public/_headers. Hand-rolled rather than a third-party package
(django-csp) because the policy is one static header, verified once against
the real admin/browsable-API pages rather than guessed - see
notes/CSP_2026-09-09.md for what was actually tested.
"""

CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self'; "
    "img-src 'self' data:; "
    "font-src 'self'; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)


class ContentSecurityPolicyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.headers.setdefault("Content-Security-Policy", CSP_POLICY)
        return response
