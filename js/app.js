import TableManager from './managers/TableManager.js';

class ODataApp {
    constructor() {
        this.apiBaseUrl = 'https://services.odata.org/TripPinRESTierService/(S(pl155em213fgzge2i2bn5l4j))/People';
        this.tableManager = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.fetchAndRenderTable();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        const sortBtn = document.getElementById('sortBtn');
        const filterBtn = document.getElementById('filterBtn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.fetchAndRenderTable());
        }
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.tableManager.showSortModal());
        }
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.tableManager.showFilterModal());
        }
    }

    async fetchAndRenderTable() {
        console.log(`Fetching all data from: ${this.apiBaseUrl}`);
        try {
            const response = await fetch(this.apiBaseUrl);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();

            const tableConfig = {
                data: data.value,
                columns: [
                    { id: 'UserName', caption: 'User Name', filterable: true, sortable: true },
                    { id: 'FirstName', caption: 'First Name', filterable: true, sortable: true },
                    { id: 'LastName', caption: 'Last Name', filterable: true, sortable: true },
                    { id: 'MiddleName', caption: 'Middle Name', filterable: true },
                    { id: 'Gender', caption: 'Gender', filterable: true, sortable: true, size: 100, align: 'center' },
                    { id: 'Age', caption: 'Age', sortable: true, size: 80, align: 'center' }
                ],
                actions: [],
                rowsPerPage: 10,
                emptyMessage: "No data found.",
                // Example of initial filters and sorters
                // filters: [{ column: 'Gender', relation: 'equals', value: 'Male' }],
                // sorters: [{ column: 'Age', order: 'desc' }]
            };

            if (!this.tableManager) {
                this.tableManager = new TableManager('table-container', tableConfig);
            } else {
                this.tableManager.updateData(data.value);
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
            document.getElementById('table-container').innerHTML = `<div class="no-tickets">Failed to load data from the server.</div>`;
        }
    }
}

// Initialize the application
const app = new ODataApp();
window.app = app;
