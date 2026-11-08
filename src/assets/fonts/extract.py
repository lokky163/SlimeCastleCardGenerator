from fontTools.varLib import mutator
from fontTools.ttLib import TTFont

# 1. Укажите имя вашего исходного вариативного файла
input_font = "Nunito-VariableFont_wght.ttf" 

# 2. Укажите настройки для нужного начертания (например, SemiBold = 600)
# Ось 'wght' отвечает за толщину шрифта
arguments = {"wght": 600}

# 3. Извлекаем статическое начертание
font = TTFont(input_font)
mutator.instantiateVariableFont(font, arguments)

# 4. Сохраняем результат в новый файл
font.save("Nunito-SemiBold.ttf")
print("Шрифт успешно извлечен!")
