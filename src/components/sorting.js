import {sortCollection, sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (data, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // @todo: #3.1 — Переключаем состояние через карту переходов
            // Сначала обновляем текущую кнопку, используя sortMap
            action.dataset.value = sortMap[action.dataset.value];
            // Теперь переменные field и order берем из обновлённой кнопки
            field = action.dataset.field;
            order = action.dataset.value;
            // @todo: #3.2 — Сброс остальных кнопок
            // проходим по всем кнопкам в массиве columns
            columns.forEach(column => {
                // Если эта кнопка НЕ та, на которую нажали (сравниваем по полю)
                if (column.dataset.field !== action.dataset.field) {
                    // Сбрасываем её в состояние 'none'
                    column.dataset.value = 'none';
                }
            });
        } else {
            // @todo: #3.3 — Найти активную сортировку при перерисовке (без клика)
            // Например, при загрузке страницы или после сброса формы
            
            columns.forEach(column => {
                // Ищем кнопку, у которой значение НЕ 'none'
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        // Применяем сортировку к данным
        return sortCollection(data, field, order);
    };
} 