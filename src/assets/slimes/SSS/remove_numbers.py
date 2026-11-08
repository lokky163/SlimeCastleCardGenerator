import os
import re

def remove_leading_numbers():
    # Получаем путь к папке, где лежит сам скрипт
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Регулярное выражение: ищет цифры и дефис в самом начале строки
    pattern = re.compile(r'^\d+-')
    
    # Перебираем все объекты в папке
    for filename in os.listdir(current_dir):
        # Пропускаем сам скрипт, чтобы случайно его не переименовать
        if filename == os.path.basename(__file__):
            continue
            
        full_path = os.path.join(current_dir, filename)
        
        # Проверяем, что это файл, а не папка
        if os.path.isfile(full_path):
            # Проверяем, начинается ли имя с цифр и дефиса
            if pattern.match(filename):
                # Создаем новое имя файла
                new_filename = pattern.sub('', filename)
                new_full_path = os.path.join(current_dir, new_filename)
                
                try:
                    os.rename(full_path, new_full_path)
                    print(f"Переименован: {filename} -> {new_filename}")
                except Exception as e:
                    print(f"Ошибка при переименовании {filename}: {e}")

if __name__ == "__main__":
    remove_leading_numbers()
