export default class TableManager {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Table container with id "${containerId}" not found.`);
        }

        const defaultConfig = {
            columns: [],
            actions: [],
            rowsPerPage: 8,
            emptyMessage: "No data available.",
            data: [],
            filters: [],
            sorters: []
        };

        this.config = { ...defaultConfig, ...config };

        this.currentPage = 1;

        this.render();
        this._createModalContainer();
        this._attachEventListeners();
    }

    updateData(newData) {
        this.config.data = newData;
        this.currentPage = 1;
        this.render();
    }

    updateFilters(newFilters) {
        this.config.filters = newFilters;
        this.currentPage = 1;
        this.render();
    }

    updateSorters(newSorters) {
        this.config.sorters = newSorters;
        this.currentPage = 1;
        this.render();
    }

    _processData() {
        let processedData = [...this.config.data];
        const { filters, sorters } = this.config;

        // Apply filters
        if (filters && filters.length > 0) {
            processedData = processedData.filter(item => {
                return filters.every(filter => {
                    const itemValue = (item[filter.column] || '').toString().toLowerCase();
                    const filterValue = (filter.value || '').toString().toLowerCase();
                    switch (filter.relation) {
                        case 'equals': return itemValue === filterValue;
                        case 'contains': return itemValue.includes(filterValue);
                        case 'startsWith': return itemValue.startsWith(filterValue);
                        default: return true;
                    }
                });
            });
        }

        // Apply sorters
        if (sorters && sorters.length > 0) {
            processedData.sort((a, b) => {
                for (const sorter of sorters) {
                    const valA = a[sorter.column];
                    const valB = b[sorter.column];
                    let comparison = 0;
                    if (valA > valB) comparison = 1;
                    else if (valA < valB) comparison = -1;
                    if (comparison !== 0) {
                        return sorter.order === 'asc' ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }

        return processedData;
    }

    _escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '—';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    render() {
        const processedData = this._processData();
        const totalPages = Math.ceil(processedData.length / this.config.rowsPerPage);
        this.currentPage = Math.max(1, Math.min(this.currentPage, totalPages));

        const startIndex = (this.currentPage - 1) * this.config.rowsPerPage;
        const endIndex = startIndex + this.config.rowsPerPage;
        const dataToRender = processedData.slice(startIndex, endIndex);

        const tableHeader = this._createHeader();
        const tableBody = this._createBody(dataToRender);
        const tableFooter = this._createFooter(totalPages);
        const emptyState = this._createEmptyState(dataToRender.length);

        this.container.innerHTML = `
            <div class="table-container" style="display: ${processedData.length > 0 ? 'block' : 'none'};">
                <table class="tickets-table">
                    ${tableHeader}
                    ${tableBody}
                </table>
                ${tableFooter}
            </div>
            ${emptyState}
        `;

        this._updateHeaderBadges();
    }

    _createHeader() {
        return `
            <thead>
                <tr>
                    ${this.config.columns.filter(col => !col.hide).map(col => `
                        <th style="width: ${col.size ? col.size + 'px' : 'auto'}; text-align: ${col.align || 'left'};">
                            ${this._escapeHtml(col.caption)}
                        </th>
                    `).join('')}
                    ${this.config.actions.length > 0 ? `<th style="text-align: center;">Actions</th>` : ''}
                </tr>
            </thead>
        `;
    }

    _createBody(data) {
        return `<tbody id="ticketsTableBody">${data.map(row => this._createRow(row)).join('')}</tbody>`;
    }

    _createRow(row) {
        const rowId = row.UserName || row.id;
        return `
            <tr data-id="${rowId}">
                ${this.config.columns.filter(col => !col.hide).map(col => {
                    const cellContent = col.render ? col.render(row) : this._escapeHtml(row[col.id]);
                    return `<td style="text-align: ${col.align || 'left'};">${cellContent}</td>`;
                }).join('')}
                ${this.config.actions.length > 0 ? this._createActionsCell(row) : ''}
            </tr>
        `;
    }

    _createActionsCell(row) {
        const rowId = row.UserName || row.id;
        return `
            <td style="text-align: center;">
                <div class="ticket-actions">
                    ${this.config.actions.map(action => {
                        const handler = action.handler ? `onclick="(${action.handler})('${rowId}')"` : '';
                        const href = action.href ? `href="${action.href(row)}"` : '';
                        const tag = action.type === 'link' ? 'a' : 'button';

                        return `
                        <${tag} class="action-btn" title="${action.title}" data-action="${action.id}" ${handler} ${href}>
                            ${action.icon}
                        </${tag}>
                    `;
                    }).join('')}
                </div>
            </td>
        `;
    }

    _createFooter(totalPages) {
        if (totalPages <= 1) return '';
        let pageButtons = '';
        const maxPageButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        return `
            <div class="table-footer">
                <button class="pagination-btn" data-page="1" ${this.currentPage === 1 ? 'disabled' : ''}>First</button>
                <button class="pagination-btn" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
                ${pageButtons}
                <button class="pagination-btn" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
                <button class="pagination-btn" data-page="${totalPages}" ${this.currentPage === totalPages ? 'disabled' : ''}>Last</button>
            </div>
        `;
    }

    _createEmptyState(dataLength) {
        return `<div class="no-tickets" style="display: ${dataLength === 0 ? 'block' : 'none'};">${this.config.emptyMessage}</div>`;
    }

    _attachEventListeners() {
        this.container.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.pagination-btn');
            if (pageBtn && !pageBtn.disabled) {
                this.currentPage = parseInt(pageBtn.dataset.page, 10);
                this.render();
                return;
            }

            // Note: Action button handlers are now attached directly via onclick attributes
            // for simplicity, as per the user-provided example.
        });
    }

    // --- Modal Management ---

    _createModalContainer() {
        if (document.getElementById('modalContainer')) return;
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        document.body.appendChild(modalContainer);
    }

    _showModal(titleHTML, bodyHTML, footerHTML, modalClass = '') {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content ${modalClass}">
                    <div class="modal-header">
                        <h3 class="modal-title">${titleHTML}</h3>
                        <button class="modal-close" title="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/></svg>
                        </button>
                    </div>
                    <div class="modal-body">${bodyHTML}</div>
                    <div class="modal-footer">${footerHTML}</div>
                </div>
            </div>
        `;
        modalContainer.style.display = 'block';

        modalContainer.querySelector('.modal-close').onclick = () => this._closeModal();
        modalContainer.querySelector('.modal-overlay').onclick = (e) => {
            if (e.target === e.currentTarget) this._closeModal();
        };
    }

    _closeModal() {
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) modalContainer.style.display = 'none';
    }

    showFilterModal() {
        const title = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.61743 7.0542H15.6174V5.0542H3.61743M0.617432 0.0541992V2.0542H18.6174V0.0541992M7.61743 12.0542H11.6174V10.0542H7.61743V12.0542Z" fill="currentColor"/></svg>
                Filter Table
            </div>`;
        const body = `
            <div class="filter-row filter-header">
                <label>Column:</label>
                <label>Relation:</label>
                <label>Value:</label>
            </div>
            <div id="filter-rows-container"></div>
            <button class="add-filter-btn" id="addFilterBtn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 8H8V13C8 13.55 7.55 14 7 14C6.45 14 6 13.55 6 13V8H1C0.45 8 0 7.55 0 7C0 6.45 0.45 6 1 6H6V1C6 0.45 6.45 0 7 0C7.55 0 8 0.45 8 1V6H13C13.55 6 14 6.45 14 7C14 7.55 13.55 8 13 8Z" fill="currentColor"/></svg>
                Add Filter
            </button>`;
        const footer = `
            <button class="secondary-btn" id="resetFilterBtn">Reset</button>
            <button class="submit-btn" id="submitFilterBtn">Apply</button>`;

        this._showModal(title, body, footer, 'filter-modal');

        const container = document.getElementById('filter-rows-container');
        if (this.config.filters.length > 0) {
            this.config.filters.forEach(filter => this._addFilterRow(container, filter));
        } else {
            this._addFilterRow(container);
        }

        document.getElementById('addFilterBtn').onclick = () => this._addFilterRow(container);
        document.getElementById('resetFilterBtn').onclick = () => {
            container.innerHTML = '';
            this._addFilterRow(container);
        };
        document.getElementById('submitFilterBtn').onclick = () => {
            const filters = [];
            container.querySelectorAll('.filter-row').forEach(row => {
                const column = row.querySelector('select[data-type="column"]').value;
                const relation = row.querySelector('select[data-type="relation"]').value;
                const value = row.querySelector('input[data-type="value"]').value;
                if (column && value) filters.push({ column, relation, value });
            });
            this.updateFilters(filters);
            this._closeModal();
        };
    }

    _addFilterRow(container, filter = {}) {
        const row = document.createElement('div');
        row.className = 'filter-row';
        const filterableColumns = this.config.columns.filter(c => c.filterable && !c.hide);
        row.innerHTML = `
            <select data-type="column">
                <option value="">Select Column</option>
                ${filterableColumns.map(c => `<option value="${c.id}" ${filter.column === c.id ? 'selected' : ''}>${c.caption}</option>`).join('')}
            </select>
            <select data-type="relation">
                <option value="contains" ${!filter.relation || filter.relation === 'contains' ? 'selected' : ''}>Contains</option>
                <option value="equals" ${filter.relation === 'equals' ? 'selected' : ''}>Equals</option>
                <option value="startsWith" ${filter.relation === 'startsWith' ? 'selected' : ''}>Starts With</option>
            </select>
            <input type="text" data-type="value" placeholder="Enter Value" value="${filter.value || ''}" />
            <button class="delete-filter-btn" title="Remove Filter">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17c1.1 0 2-.9 2-2V6h1V4h-5V3H9zM7 6h10v13H7V6zm2 2v9h2V8H9zm4 0v9h2V8h-2z" fill="#A10900"/></svg>
            </button>`;
        container.appendChild(row);
        row.querySelector('.delete-filter-btn').onclick = () => row.remove();
    }

    showSortModal() {
        const title = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor"><path d="M278.6 438.6L182.6 534.6C170.1 547.1 149.8 547.1 137.3 534.6L41.3 438.6C28.8 426.1 28.8 405.8 41.3 393.3C53.8 380.8 74.1 380.8 86.6 393.3L128 434.7V128c0-17.7 14.3-32 32-32s32 14.3 32 32v306.7L233.4 393.3c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3zM352 96h32c17.7 0 32 14.3 32 32s-14.3 32-32 32h-32c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128h96c17.7 0 32 14.3 32 32s-14.3 32-32 32h-96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128h160c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128h224c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
                Sort Table
            </div>`;
        const body = `
            <div class="sort-row sort-header">
                <label>Column:</label>
                <label>Order:</label>
            </div>
            <div id="sort-rows-container"></div>
            <button class="add-sort-btn" id="addSortBtn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 8H8V13C8 13.55 7.55 14 7 14C6.45 14 6 13.55 6 13V8H1C0.45 8 0 7.55 0 7C0 6.45 0.45 6 1 6H6V1C6 0.45 6.45 0 7 0C7.55 0 8 0.45 8 1V6H13C13.55 6 14 6.45 14 7C14 7.55 13.55 8 13 8Z" fill="currentColor"/></svg>
                Add Sort Level
            </button>`;
        const footer = `
            <button class="secondary-btn" id="resetSortBtn">Reset</button>
            <button class="submit-btn" id="submitSortBtn">Apply</button>`;

        this._showModal(title, body, footer, 'sort-modal');

        const container = document.getElementById('sort-rows-container');
        if (this.config.sorters.length > 0) {
            this.config.sorters.forEach(sorter => this._addSortRow(container, sorter));
        } else {
            this._addSortRow(container);
        }

        document.getElementById('addSortBtn').onclick = () => this._addSortRow(container);
        document.getElementById('resetSortBtn').onclick = () => {
            container.innerHTML = '';
            this._addSortRow(container);
        };
        document.getElementById('submitSortBtn').onclick = () => {
            const sorters = [];
            container.querySelectorAll('.sort-row').forEach(row => {
                const column = row.querySelector('select[data-type="column"]').value;
                const order = row.querySelector('select[data-type="order"]').value;
                if (column) sorters.push({ column, order });
            });
            this.updateSorters(sorters);
            this._closeModal();
        };
    }

    _addSortRow(container, sorter = {}) {
        const row = document.createElement('div');
        row.className = 'sort-row';
        const sortableColumns = this.config.columns.filter(c => c.sortable && !c.hide);
        row.innerHTML = `
            <select data-type="column">
                <option value="">Select Column</option>
                ${sortableColumns.map(c => `<option value="${c.id}" ${sorter.column === c.id ? 'selected' : ''}>${c.caption}</option>`).join('')}
            </select>
            <select data-type="order">
                <option value="asc" ${!sorter.order || sorter.order === 'asc' ? 'selected' : ''}>Ascending</option>
                <option value="desc" ${sorter.order === 'desc' ? 'selected' : ''}>Descending</option>
            </select>
            <button class="delete-sort-btn" title="Remove Sort Level">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17c1.1 0 2-.9 2-2V6h1V4h-5V3H9zM7 6h10v13H7V6zm2 2v9h2V8H9zm4 0v9h2V8h-2z" fill="#A10900"/></svg>
            </button>`;
        container.appendChild(row);
        row.querySelector('.delete-sort-btn').onclick = () => row.remove();
    }

    _updateHeaderBadges() {
        this._updateBadge('filter-badge', this.config.filters, () => this.updateFilters([]));
        this._updateBadge('sort-badge', this.config.sorters, () => this.updateSorters([]));
    }

    _updateBadge(badgeId, items, clearAction) {
        const badge = document.getElementById(badgeId);
        if (!badge) return;
        if (items.length > 0) {
            const clearId = `clear-${badgeId}`;
            badge.innerHTML = `${items.length} <button class="badge-clear" id="${clearId}">&times;</button>`;
            badge.classList.add('active');
            const clearBtn = document.getElementById(clearId);
            if (clearBtn) clearBtn.onclick = (e) => { e.stopPropagation(); clearAction(); };
        } else {
            badge.classList.remove('active');
            badge.textContent = '';
        }
    }
}
