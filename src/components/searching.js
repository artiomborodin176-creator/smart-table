import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const compareSearch = createComparison(
        ['skipEmptyTargetValues'], // Правило: если поле поиска пустое, ничего не делаем
        [
            // Правило: искать значение из поля 'search' (или как оно у тебя называется в state)
            // в списке указанных полей.
            rules.searchMultipleFields(
                'search', // Имя поля в объекте state, откуда брать текст поиска
                ['date', 'customer', 'seller'], // Список полей в строке данных (row), где искать
                false     // Флаг (обычно означает поиск подстроки, а не точного совпадения)
            )
        ]
    );
    return (data, state, action) => {
        // Если есть действие очистки (кнопка reset), сбрасываем поле
        if (action && action.name === 'clear') {
            if (searchField) { 
                searchField.value = '';
            }
            // Можно также очистить state, если он мутабельный, но обычно достаточно очистить DOM
        }
        return data.filter(row => compareSearch(row, state));
    }
}

