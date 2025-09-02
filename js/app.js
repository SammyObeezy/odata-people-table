import TableManager from './managers/TableManager.js';

class ODataApp {
    constructor() {
        this.apiBaseUrl = 'https://services.odata.org/v4/TripPinServiceRW/People';
        this.tableManager = null;
        this.isLoading = false;
        this.dataMode = 'server';
        this.init();
    }

    init() {
        this.setupEventListeners();
        if (this.dataMode === 'server') {
            this.createTableManager();
            this.fetchInitialServerData();
        } else {
            this.fetchAllDataAndRender();
        }
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        const sortBtn = document.getElementById('sortBtn');
        const filterBtn = document.getElementById('filterBtn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.dataMode === 'server' ? this.tableManager._requestStateUpdate() : this.fetchAllDataAndRender());
        }
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.tableManager.showSortModal());
        }
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.tableManager.showFilterModal());
        }
    }

    createTableManager(initialData = []) {
        const tableConfig = {
            data: initialData,
            columns: [
                { id: 'UserName', caption: 'User Name', filterable: true, sortable: true },
                { id: 'FirstName', caption: 'First Name', filterable: true, sortable: true },
                { id: 'LastName', caption: 'Last Name', filterable: true, sortable: true },
                { id: 'MiddleName', caption: 'Middle Name', filterable: true },
                { id: 'Gender', caption: 'Gender', filterable: true, sortable: true, size: 100, align: 'center' },
                { id: 'Age', caption: 'Age', sortable: true, size: 80, align: 'center', type: 'number' }
            ],
            actions: [],
            rowsPerPage: 8,
            emptyMessage: "No data found.",
            dataMode: this.dataMode,
            onStateChange: this.dataMode === 'server' ? (state) => this.fetchServerData(state) : null
        };

        this.tableManager = new TableManager('table-container', tableConfig);
    }

    fetchInitialServerData() {
        const initialState = {
            page: 1,
            filters: [],
            sorters: [],
            rowsPerPage: 8
        };
        this.fetchServerData(initialState);
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = this.isLoading ? 'flex' : 'none';
        }
    }

    async fetchAllDataAndRender() {
        console.log(`Fetching all data from: ${this.apiBaseUrl}`);
        try {
            let allPeople = [];
            this.setLoading(true);
            let nextLink = this.apiBaseUrl;

            while (nextLink) {
                const response = await fetch(nextLink);
                if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
                const data = await response.json();
                allPeople = allPeople.concat(data.value);
                nextLink = data['@odata.nextLink'];
            }

            if (!this.tableManager) {
                this.createTableManager(allPeople);
            } else {
                this.tableManager.updateData(allPeople);
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
            document.getElementById('table-container').innerHTML = `<div class="no-tickets">Failed to load data.</div>`;
        } finally {
            this.setLoading(false);
        }
    }

    async fetchTotalCount() {
        try {
            const countUrl = `${this.apiBaseUrl}/$count`;
            const response = await fetch(countUrl);
            const totalCount = await response.text();
            return parseInt(totalCount);
        } catch (error) {
            console.error('Failed to fetch total count:', error);
            return 0;
        }
    }

    async fetchServerData(state) {
        this.setLoading(true);
        const url = this._buildODataUrl(state);
        console.log(`Fetching server-side data from: ${url}`);
        try {
            const [dataResponse, totalCount] = await Promise.all([
                fetch(url),
                this.fetchTotalCount()
            ]);
            
            if (!dataResponse.ok) throw new Error(`API request failed with status ${dataResponse.status}`);
            const data = await dataResponse.json();

            this.tableManager.updateData(data.value, totalCount);

        } catch (error) {
            console.error("Failed to fetch data:", error);
            document.getElementById('table-container').innerHTML = `<div class="no-tickets">Failed to load data.</div>`;
        } finally {
            this.setLoading(false);
        }
    }

    _buildODataUrl(state) {
        const { page = 1, filters = [], sorters = [], rowsPerPage = 8 } = state;
        const url = new URL(this.apiBaseUrl);

        url.searchParams.append('$count', 'true');
        url.searchParams.append('$top', rowsPerPage);
        url.searchParams.append('$skip', (page - 1) * rowsPerPage);

        if (sorters.length > 0) {
            const orderby = sorters.map(s => `${s.column} ${s.order}`).join(',');
            url.searchParams.append('$orderby', orderby);
        }

        if (filters.length > 0) {
            const columnTypes = this.tableManager.config.columns.reduce((acc, col) => {
                acc[col.id] = col.type || 'string';
                return acc;
            }, {});

            const filterClauses = filters.map(f => {
                const columnType = columnTypes[f.column];

                if (columnType === 'number') {
                    if (isNaN(f.value) || f.relation !== 'equals') return '';
                    return `${f.column} eq ${f.value}`;
                } else {
                    const filterValue = f.value.replace(/'/g, "''");
                    const val = `'${filterValue}'`;
                    switch (f.relation) {
                        case 'equals': return `tolower(${f.column}) eq tolower(${val})`;
                        case 'contains': return `contains(tolower(${f.column}), tolower(${val}))`;
                        case 'startsWith': return `startswith(tolower(${f.column}), tolower(${val}))`;
                        default: return '';
                    }
                }
            }).filter(Boolean);

            if (filterClauses.length > 0) url.searchParams.append('$filter', filterClauses.join(' and '));
        }
        return url.toString();
    }
}

const app = new ODataApp();
window.app = app;