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
        const from = preparedState.totalFrom;
        const to = preparedState.totalTo;

        // Собираем массив [from, to] для поля 'total', чтобы сработало правило arrayAsRange
        if (from !== undefined && from !== '' && to !== undefined && to !== '') {
            preparedState.total = [Number(from), Number(to)];
        } else if (from !== undefined && from !== '') {
            preparedState.total = [Number(from), Infinity];
        } else if (to !== undefined && to !== '') {
            preparedState.total = [-Infinity, Number(to)];
        }
        // -------------------------------------

        return data.filter(row => compare(row, preparedState));
    };
}