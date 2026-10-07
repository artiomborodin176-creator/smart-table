import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import {initTable} from "./components/table.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js"
// @todo: подключение


// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */

const sampleTable = initTable(
    {
        tableTemplate: 'table',
        rowTemplate: 'row',
        before: ['search', 'header', 'filter'],
        after: ['pagination']
    }, 
    render
);
sampleTable.render(data);
// @todo: инициализация
    //поиск
    const searchInput = sampleTable.container.querySelector('input[data-field="search"]');
    const applySearching = initSearching(searchInput); 
    //фильтры 
const filterElements = {};

Object.keys(indexes).forEach(key => {
    // 1. Пытаемся найти элемент по имени из данных (на случай совпадения)
    let element = sampleTable.container.querySelector(`[name="${key}"]`);
    // 2. Если не нашли, пробуем вариант в единственном числе (убираем 's')
    if (!element && key.endsWith('s')) {
        const singularKey = key.slice(0, -1);
        element = sampleTable.container.querySelector(`[name="${singularKey}"]`);
        // Если мы нашли элемент через singularKey,то и ключ в объекте должен быть singularKey, чтобы совпадать с data-field кнопки!
        if (element) {
            filterElements[singularKey] = element;
            return; // Прерываем цикл для этого ключа, так как нашли
        }
    }
    // 3. Если всё ещё не нашли, пробуем искать по data-field (на всякий случай)
    if (!element) {
        element = sampleTable.container.querySelector(`[data-field="${key}"]`);
        if (element) {
            filterElements[key] = element;
        }
    }
    // 4. Если нашли обычным способом (без удаления 's')
    if (element && !filterElements.hasOwnProperty(key)) {
         filterElements[key] = element;
    }
});
const applyFiltering = initFiltering(filterElements, indexes);
    // сортировка
    const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
        sampleTable.header.elements.sortByDate,
        sampleTable.header.elements.sortByTotal
    ]);
    
    //пагинация
    const applyPagination = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
if (appRoot) {
    appRoot.appendChild(sampleTable.container);
    render(); // Первый рендер
} 

function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);    // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);                // номер страницы по умолчанию 1 и тоже число

    return {                                            // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page
    }; 
}

function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let result = [...data]; // копируем для последующего изменения
    // @todo: использование
    result = applySearching(result, state, action);
    result = applyFiltering(result, state, action);
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);
    sampleTable.render(result);
}
