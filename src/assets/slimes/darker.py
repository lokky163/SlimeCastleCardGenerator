import cv2
import numpy as np

def multiply_channels(image_path, output_path, r_coef, g_coef, b_coef):
    # Загружаем изображение со всеми каналами (включая альфа-канал)
    image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    
    if image is None:
        print("Ошибка: Не удалось загрузить изображение.")
        return

    # Переводим в float32 для точности вычислений
    image = image.astype(np.float32)
    
    # Умножаем только B, G и R каналы (индексы 0, 1, 2)
    image[:, :, 0] *= b_coef
    image[:, :, 1] *= g_coef
    image[:, :, 2] *= r_coef
    
    # Ограничиваем значения всех каналов в диапазоне [0, 255]
    image = np.clip(image, 0, 255)
    
    # Возвращаем исходный тип данных
    image = image.astype(np.uint8)
    
    # Сохраняем результат
    cv2.imwrite(output_path, image)
    print(f"Изображение успешно сохранено в: {output_path}")

multiply_channels(
    image_path="TextBackGround.png",
    output_path="TextBackGroundD.png",
    r_coef=151 / 189,
    g_coef=81  / 102,
    b_coef=76  / 96,
)
