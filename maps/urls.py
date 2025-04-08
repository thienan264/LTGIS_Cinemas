from django.urls import path
from . import views

app_name = 'maps'

urlpatterns = [
    path('', views.simplemap),
    path('co-ban/', views.simplemap, name="co-ban"),
    path('tim-kiem/', views.search, name="tim-kiem"),
    path('cinema/', views.cinema, name="cinema"),
    path('api/geojson/cinema/', views.cinema_geojson, name='rap_data'),

]
