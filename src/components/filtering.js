import { createComparison, rules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // 1. Заполняем выпадающие списки опциями из indexes
    Object.keys(indexes).forEach((elementName) => {
        // elements[elementName] существует, потому что мы собрали его в main.js
        const selectElement = elements[elementName];
        if (selectElement) {
            // Очищаем старые опции (на случай повторного рендера), оставляем первую ("—")
            const firstOption = selectElement.firstElementChild;
            // Удаляем все опции кроме первой
            while (selectElement.lastElementChild !== firstOption) {
                selectElement.removeChild(selectElement.lastElementChild);
            }
            // Добавляем новые опции из indexes
            Object.values(indexes[elementName]).forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                selectElement.appendChild(option);
            });
        }
    });
    // 2. НАСТРАИВАЕМ КОМПАРАТОР ПРАВИЛЬНО
    // Вместо defaultRules собираем правила вручную.
    const compare = createComparison([
        'skipEmptyTargetValues', 
        'caseInsensitiveStringIncludes',
        'arrayAsRange'
        ],
    );
    // 3. Возвращаем функцию фильтрации
    return (data, state, action) => {
        const preparedState = { ...state };
        // Собираем диапазон для поля 'total'
        const from = preparedState.totalFrom;
        const to = preparedState.totalTo;
        // Если оба поля заполнены, формируем массив
        if (from !== undefined && from !== '' && to !== undefined && to !== '') {
            preparedState.total = [Number(from), Number(to)];
        } else if (from !== undefined && from !== '') {
            preparedState.total = [Number(from), Infinity];
        } else if (to !== undefined && to !== '') {
            // Если есть только "до"
            preparedState.total = [-Infinity, Number(to)];
        }
        // Обработка кнопки очистки
        if (action && action.name === 'clear') {
            const fieldName = action.dataset.field;
            const input = elements[fieldName];
            
            if (input) {
                input.value = ''; 
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                }
            }
        }

        // Фильтруем данные, используя ПОДГОТОВЛЕННЫЙ state
        return data.filter(row => compare(row, preparedState));
    };
} 