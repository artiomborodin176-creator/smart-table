import {getPages} from "../lib/utils.js";

export const initPagination = (elements, createPage) => {
    const { pages, fromRow, toRow, totalRows } = elements;
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();
    
    let pageCount = 0; // Храним состояние внутри замыкания

    return {
        applyPagination: (query, state, action) => {
            const limit = state.rowsPerPage;
            let page = state.page;

            if (action) {
                switch (action.name) {
                    case 'prev': page = Math.max(1, page - 1); break;
                    case 'next': page = Math.min(pageCount || 1, page + 1); break;
                    case 'first': page = 1; break;
                    case 'last': page = pageCount || 1; break;
                }
            }

            return Object.assign({}, query, { limit, page });
        },

        updatePagination: (total, query) => { // передаём total и data сюда
            pageCount = Math.ceil(total / query.limit);
            const { page } = query;

            const visiblePages = getPages(page, pageCount, 5);
            pages.replaceChildren(...visiblePages.map(p => {
                const el = pageTemplate.cloneNode(true);
                return createPage(el, p, p === page);
            }));

            fromRow.textContent = total === 0 ? 0 : (page - 1) * query.limit + 1;
            toRow.textContent = total === 0 ? 0 : Math.min(page * query.limit, total); // Лучше total, а не data.length
            totalRows.textContent = total;
        }
    };
}; 
