#from django.http import HttpResponse
from django.shortcuts import render
def homepage(request):
    #return HttpResponse("Xin chao Django")
    return render(request, 'home.html')

def aboutpage(request):
    #return HttpResponse("Day la trang gioi thieu")
    return render(request, 'about.html')