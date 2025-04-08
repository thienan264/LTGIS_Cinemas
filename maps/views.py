from django.shortcuts import render
from .models import RapChieuPhim
from django.http import JsonResponse

# Create your views here.
def simplemap(request):
    return render(request, 'simple-map.html')
def search(request):
    return render(request, 'search-address.html')
def cinema(request):
    return render(request, 'index.html')
def cinema_geojson(request):
    features = []

    for rap in RapChieuPhim.objects.all():
        # Lấy danh sách giờ chiếu có liên kết với rạp
        gio_chieu_list = rap.gio_chieu.select_related('phim').all()

        # Chuẩn bị danh sách phim với giờ chiếu
        lich_chieu = []
        for gio in gio_chieu_list:
            lich_chieu.append({
                "ten_phim": gio.phim.ten_phim,
                "the_loai": gio.phim.the_loai,
                "thoi_luong": gio.phim.thoi_luong,
                "gio_chieu": gio.thoi_gian.strftime("%H:%M %d-%m-%Y")
            })

        # Tạo feature GeoJSON
        features.append({
            "type": "Feature",
            "properties": {
                "name": rap.ten_rap,
                "address": rap.dia_chi,
                "description": rap.mo_ta,
                "lich_chieu": lich_chieu
            },
            "geometry": {
                "type": "Point",
                "coordinates": [rap.kinh_do, rap.vi_do]
            }
        })

    data = {
        "type": "FeatureCollection",
        "features": features
    }

    return JsonResponse(data)