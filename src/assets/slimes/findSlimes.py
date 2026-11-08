import os
import re

def generate_ts_arrays():
    # Настройки папок и выходного файла
    folders = ['B', 'A', 'S', 'SS', 'SSS']
    output_file = 'output_arrays.ts'
    
    lines = []
    
    for folder in folders:
        if not os.path.exists(folder):
            print(f"Папка {folder} не найдена, пропускаем.")
            continue
            
        files = os.listdir(folder)
        valid_files = []
        
        # Фильтруем файлы x-name и отсекаем расширения (.png, .jpg, .jpeg, .webp)
        for filename in files:
            # Регулярное выражение теперь отделяет имя от расширения изображения
            match = re.match(r'^(\d+)-(.+?)\.(png|jpg|jpeg|webp)$', filename, re.IGNORECASE)
            if match:
                x = int(match.group(1))
                name_without_ext = match.group(2)
                
                # Собираем строку обратно в формате "x-name", но уже без расширения
                clean_name = f"{x}-{name_without_ext}"
                valid_files.append((x, clean_name))
                
        # Сортируем по числовому возрастанию (1, 2, 3...)
        valid_files.sort(key=lambda item: item[0])
        
        # Формируем блок кода для TypeScript
        variable_name = f"{folder.upper()}_SLIME_NAME"
        
        lines.append(f"export const {variable_name} = [")
        for _, clean_name in valid_files:
            lines.append(f"  '{clean_name}',")
        lines.append("];\n")
        
    # Записываем всё в файл
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
        
    print(f"Готово! Результат без расширений сохранен в файл: {output_file}")

if __name__ == "__main__":
    generate_ts_arrays()
