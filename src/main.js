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
    let element = null;
    let finalKey = key; // Ключ, под которым мы сохраним элемент

    // 1. Пытаемся найти элемент по точному имени из данных
    element = sampleTable.container.querySelector(`[name="${key}"]`);

    // 2. Если не нашли и ключ во множественном числе (customers), пробуем единственное (customer)
    if (!element && key.endsWith('s')) {
        const singularKey = key.slice(0, -1);
        element = sampleTable.container.querySelector(`[name="${singularKey}"]`);
        
        if (element) {
            finalKey = singularKey; // Сохраняем под ключом в единственном числе
        }
    }

    // 3. Если всё ещё не нашли, пробуем искать по data-field (резервный вариант)
    if (!element) {
        element = sampleTable.container.querySelector(`[data-field="${key}"]`);
        if (element) {
            finalKey = key;
        }
    }

    // 4. Если элемент найден, сохраняем его в объект
    if (element) {
        filterElements[finalKey] = element;
    } else {
        console.warn(`⚠️ Не удалось найти элемент для фильтра: ${key}`);
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
    if (action && action.name === 'clear') {
    const fieldName = action.dataset.field;
    // Ищем элемент по имени поля (оно должно совпадать с name в HTML)
    const input = sampleTable.container.querySelector(`[name="${fieldName}"]`);
        
    if (input) {
    input.value = ''; // Очищаем визуально
    // Если это select, сбрасываем индекс
        if (input.tagName === 'SELECT') {
        input.selectedIndex = 0;
        }
    }
}     

    let state = collectState(); // состояние полей из таблицы
    let result = [...data]; // копируем для последующего изменения
    // @todo: использование
    result = applySearching(result, state, action);
    result = applyFiltering(result, state, action);
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);
    sampleTable.render(result);
}
