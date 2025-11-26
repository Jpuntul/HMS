from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    page_size = 20  # Default page size
    page_size_query_param = "page_size"  # Allow client to set page size
    max_page_size = 100  # Maximum allowed page size
