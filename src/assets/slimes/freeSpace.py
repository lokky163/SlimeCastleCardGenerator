import os
import re

def get_valid_files(folder, n):
    """
    Вспомогательная функция: находит файлы формата x-name, где x >= n.
    Возвращает список кортежей: (x, name, original_filename)
    """
    if not os.path.exists(folder):
        print(f"Папка {folder} не найдена.")
        return []

    files = os.listdir(folder)
    valid_files = []

    for filename in files:
        # Регулярное выражение ищет число в начале строки перед дефисом
        match = re.match(r'^(\d+)-(.+)$', filename)
        if match:
            x = int(match.group(1))
            name = match.group(2)
            if x >= n:
                valid_files.append((x, name, filename))
                
    return valid_files


def shift_files_up(folders, n):
    """
    Увеличивает номера файлов на +1, начиная с номера n.
    Сортировка REVERSE=TRUE (с конца), чтобы освободить место.
    """
    print(f"--- Освобождаем место для {n} (сдвиг +1) ---")
    for folder in folders:
        valid_files = get_valid_files(folder, n)
        
        # Сортируем от большего к меньшему (например: 4, 3, 2...)
        valid_files.sort(key=lambda item: item[0], reverse=True)

        for x, name, original_filename in valid_files:
            old_path = os.path.join(folder, original_filename)
            new_filename = f"{x + 1}-{name}"
            new_path = os.path.join(folder, new_filename)
            
            os.rename(old_path, new_path)
            print(f"[{folder}]: {original_filename} -> {new_filename}")


def shift_files_down(folders, n):
    """
    Уменьшает номера файлов на -1, начиная с номера n.
    Сортировка REVERSE=FALSE (с начала), чтобы занять пустое место.
    """
    print(f"\n--- Заполняем место (сдвиг -1 для номеров >= {n}) ---")
    for folder in folders:
        valid_files = get_valid_files(folder, n)
        
        # Сортируем от меньшего к большему (например: 2, 3, 4...)
        valid_files.sort(key=lambda item: item[0], reverse=False)

        for x, name, original_filename in valid_files:
            # Защита от создания файлов с нулевым или отрицательным номером (0-name)
            if x - 1 < 1:
                print(f"[{folder}]: Пропуск {original_filename}, так как номер станет меньше 1")
                continue
                
            old_path = os.path.join(folder, original_filename)
            new_filename = f"{x - 1}-{name}"
            new_path = os.path.join(folder, new_filename)
            
            os.rename(old_path, new_path)
            print(f"[{folder}]: {original_filename} -> {new_filename}")


# --- Пример использования ---
if __name__ == "__main__":
    target_folders = ['A', 'B', 'S', 'SS', 'SSS']
    start_number = 26  # Номер 'n', с которым будем работать

    # Пример 1: Освободить место (сдвинуть вверх)
    shift_files_up(target_folders, start_number)

    # Пример 2: Уменьшить номера (сдвинуть вниз)
    # На практике эту строку вызывают отдельно, когда нужно "схлопнуть" пустоту
    # shift_files_down(target_folders, start_number)
