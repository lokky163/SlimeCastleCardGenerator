from PIL import Image

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

img = "myth.png"
clear_low_alpha_pixels(img, img)
make_non_black_pixels_opaque(img, img)