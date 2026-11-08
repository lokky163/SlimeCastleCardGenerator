
from PIL import Image, ImageFilter

def crop_center_square(image_path, output_path):
    # Открываем изображение (Pillow автоматически сохраняет альфа-канал для PNG)
    with Image.open(image_path) as img:
        width, height = img.size
        
        # Целевые размеры квадрата
        target_side = 176
        
        # Вычисляем координаты для обрезки по центру
        left = (width - target_side) // 2
        top = (height - target_side) // 2
        right = left + target_side
        bottom = top + target_side
        
        # Обрезаем изображение
        cropped_img = img.crop((left, top, right, bottom))
        
        # Сохраняем результат
        cropped_img.save(output_path)
        print(f"Изображение успешно обрезано и сохранено в {output_path}")

def resize_adaptive_sharp(image_path, output_path, new_size):
    """
    Сжимает квадратное изображение с адаптивным повышением резкости (аналог Paint.NET)
    :param image_path: Путь к исходному файлу
    :param output_path: Путь для сохранения результата
    :param new_size: Целевой размер стороны квадрата (int)
    """
    with Image.open(image_path).convert("RGBA") as img:
        # 1. Разделяем каналы, чтобы применить гамма-коррекцию только к RGB
        r, g, b, a = img.split()
        rgb_img = Image.merge("RGB", (r, g, b))
        
        # 2. Гамма-коррекция (перевод в линейное пространство для правильного смешивания пикселей)
        # Это защищает тонкие линии от исчезновения при сжатии
        linear_rgb = rgb_img.point(lambda p: pow(p / 255.0, 2.2) * 255.0)
        
        # 3. Сжатие в линейном пространстве методом Lanczos (высокое качество)
        resized_linear = linear_rgb.resize((new_size, new_size), resample=Image.Resampling.LANCZOS)
        
        # 4. Возвращаем RGB в стандартное пространство sRGB
        resized_rgb = resized_linear.point(lambda p: pow(p / 255.0, 1.0 / 2.2) * 255.0).convert("RGB")
        
        # 5. Сжимаем альфа-канал отдельно (для маски прозрачности гамма-коррекция не нужна)
        resized_a = a.resize((new_size, new_size), resample=Image.Resampling.LANCZOS)
        
        # 6. Адаптивное повышение резкости (Adaptive Sharpening)
        # В отличие от обычного Sharpen, UnsharpMask с порогом (threshold)
        # повышает резкость только там, где разница контраста выше шума (границы и текстуры).
        # Параметры подбираются под масштаб: radius=1.0, percent=120, threshold=4
        sharpened_rgb = resized_rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=4))
        
        # 7. Собираем итоговое RGBA изображение
        final_img = Image.merge("RGBA", (*sharpened_rgb.split(), resized_a))
        
        # Сохраняем результат
        final_img.save(output_path)
        print(f"Изображение успешно сжато методом Adaptive Sharp в размер {new_size}x{new_size}")

# Пример использования: сожмем картинку со 194 до 128 пикселей
from PIL import Image

def add_transparent_padding(image_path, output_path, top=0, bottom=0, left=0, right=0):
    """
    Добавляет прозрачные черные пиксели (RGBA: 0,0,0,0) по краям изображения.
    
    :param image_path: Путь к исходному изображению
    :param output_path: Путь для сохранения результата
    :param top: Количество пикселей сверху
    :param bottom: Количество пикселей снизу
    :param left: Количество пикселей слева
    :param right: Количество пикселей справа
    """
    with Image.open(image_path).convert("RGBA") as img:
        orig_width, orig_height = img.size
        
        # 1. Вычисляем размеры нового (расширенного) холста
        new_width = orig_width + left + right
        new_height = orig_height + top + bottom
        
        # 2. Создаем новый холст, залитый цветом (0, 0, 0, 0)
        # По умолчанию Image.new создает абсолютно прозрачный черный фон в режиме RGBA
        new_img = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        
        # 3. Вставляем оригинальное изображение со смещением
        # Координаты (left, top) определяют левый верхний угол вставки оригинала
        new_img.paste(img, (left, top))
        
        # 4. Сохраняем результат
        new_img.save(output_path)
        print(f"Поля успешно добавлены. Новый размер: {new_width}x{new_height}")



img1 = "helmet.png"
img2 = "chestplate.png"
img3 = "ring.png"
img4 = "sword.png"

# crop_center_square(img1, img1)
# crop_center_square(img2, img2)
# crop_center_square(img3, img3)
# crop_center_square(img4, img4)

# resize_adaptive_sharp(img1, img1, 152)
# resize_adaptive_sharp(img2, img2, 152)
# resize_adaptive_sharp(img3, img3, 152)
# resize_adaptive_sharp(img4, img4, 152)

# Пример использования:
add_transparent_padding(img1, img1, bottom=18)
add_transparent_padding(img2, img2, bottom=18)
add_transparent_padding(img3, img3, bottom=18)
add_transparent_padding(img4, img4, bottom=18)