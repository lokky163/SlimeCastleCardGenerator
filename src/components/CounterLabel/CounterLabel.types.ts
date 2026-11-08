export interface CounterLabelProps {
  label: string;          // Текст лейбла (например, "Уровень")
  min: number;            // Минимальное возможное значение
  max: number;            // Максимальное возможное значение
  value: number;          // Текущее значение (контролируется родителем)
  onChange: (newValue: number) => void; // Тот самый "лисенер" — функция, вызываемая при изменении
}
