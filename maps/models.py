from django.db import models

class RapChieuPhim(models.Model):
    ten_rap = models.CharField(max_length=255)
    dia_chi = models.TextField()
    kinh_do = models.FloatField()  # longitude
    vi_do = models.FloatField()    # latitude
    mo_ta = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.ten_rap


class Phim(models.Model):
    ten_phim = models.CharField(max_length=255)
    the_loai = models.CharField(max_length=100)
    thoi_luong = models.PositiveIntegerField(help_text="Thời lượng (phút)")
    mo_ta = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.ten_phim


class GioChieu(models.Model):
    rap = models.ForeignKey(RapChieuPhim, on_delete=models.CASCADE, related_name='gio_chieu')
    phim = models.ForeignKey(Phim, on_delete=models.CASCADE, related_name='gio_chieu')
    thoi_gian = models.DateTimeField()

    def __str__(self):
        return f"{self.phim.ten_phim} @ {self.rap.ten_rap} - {self.thoi_gian.strftime('%H:%M %d/%m/%Y')}"
