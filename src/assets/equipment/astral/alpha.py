from PIL import Image, ImageFilter

def make_non_black_pixels_opaque(image_path, output_path):
    # Открываем изображение и строго переводим в режим RGBA
    with Image.open(image_path).convert("RGBA") as img:
        # Загружаем пиксели в память для быстрой работы
        pixels = img.load()
        width, height = img.size

        for x in range(width):
            for y in range(height):
                r, g, b, a = pixels[x, y]
                
                # Если пиксель НЕ чисто черный, делаем его полностью непрозрачным
                if not (r == 0 and g == 0 and b == 0):
                    pixels[x, y] = (r, g, b, 255)

        # Сохраняем результат
        img.save(output_path)
        print(f"Обработанное изображение сохранено в {output_path}")

# make_non_black_pixels_opaque(img, img)

def clear_low_alpha_pixels(image_path, output_path):
    # Открываем изображение и переводим в RGBA
    with Image.open(image_path).convert("RGBA") as img:
        pixels = img.load()
        width, height = img.size

        for x in range(width):
            for y in range(height):
                r, g, b, a = pixels[x, y]
                
                # Если альфа-канал меньше 30, делаем пиксель черным и прозрачным
                if a < 100:
                    pixels[x, y] = (0, 0, 0, 0)

        # Сохраняем результат
        img.save(output_path)
        print(f"Изображение очищено от низкого альфа-канала и сохранено в {output_path}")

def smooth_alpha_edges(image_path, output_path):
    # 1. Открываем оригинал в RGBA
    with Image.open(image_path).convert("RGBA") as img:
        orig_w, orig_h = img.size
        
        # 2. Разделяем на цвета и альфа-канал
        r, g, b, a = img.split()
        
        # 3. Supersampling: увеличиваем альфа-маску в 4 раза для субпиксельной точности
        # Фильтр Resampling.LANCZOS дает идеальные нелинейные переходы
        a_large = a.resize((orig_w * 4, orig_h * 4), resample=Image.Resampling.LANCZOS)
        
        # 4. Легкое размытие увеличенной маски (радиус 2 на большом размере = 0.5 на оригинале)
        # Это сгладит «лесенку» и создаст мягкий градиент на границе
        a_large_blurred = a_large.filter(ImageFilter.GaussianBlur(radius=2))
        
        # 5. Возвращаем маску к исходному размеру с нелинейным сжатием
        a_smooth = a_large_blurred.resize((orig_w, orig_h), resample=Image.Resampling.LANCZOS)
        
        # 6. Собираем изображение обратно с новой сглаженной альфой
        smoothed_img = Image.merge("RGBA", (r, g, b, a_smooth))
        
        # Сохраняем результат
        smoothed_img.save(output_path)
        print(f"Сглаженное изображение сохранено в {output_path}")

# Пример использования

img1 = "helmet.png"
img2 = "chestplate.png"
img3 = "ring.png"
img4 = "sword.png"

# clear_low_alpha_pixels(img1, img1)
# make_non_black_pixels_opaque(img1, img1)

# clear_low_alpha_pixels(img2, img2)
# make_non_black_pixels_opaque(img2, img2)

# clear_low_alpha_pixels(img3, img3)
# make_non_black_pixels_opaque(img3, img3)

# clear_low_alpha_pixels(img4, img4)
# make_non_black_pixels_opaque(img4, img4)

smooth_alpha_edges(img1, img1)
smooth_alpha_edges(img2, img2)
smooth_alpha_edges(img3, img3)
smooth_alpha_edges(img4, img4)
