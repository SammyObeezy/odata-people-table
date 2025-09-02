# TableManager - Universal Data Table Component

A powerful, lightweight, and highly customizable vanilla JavaScript table component that handles pagination, filtering, sorting, and data management for both client-side and server-side operations.

## ✨ Features

- **🔄 Dual Mode Support**: Client-side and server-side data processing
- **📄 Advanced Pagination**: Configurable page sizes with smart navigation
- **🔍 Dynamic Filtering**: Multi-column filtering with various relation types
- **📊 Multi-level Sorting**: Sort by multiple columns with ascending/descending options
- **⚡ Real-time Updates**: Instant data manipulation and rendering
- **🎨 Fully Customizable**: CSS-based styling with complete theme control
- **📱 Responsive Design**: Mobile-friendly with flexible layouts
- **🛡️ XSS Protection**: Built-in HTML escaping for security
- **🔧 Action System**: Configurable row-level actions and buttons

## 📦 Installation

Simply include the TableManager.js file in your project:

```javascript
import TableManager from './path/to/TableManager.js';
```

## 🚀 Quick Start

### Basic Usage

```javascript
// Initialize with minimal configuration
const tableManager = new TableManager('table-container', {
    data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
    ],
    columns: [
        { id: 'name', caption: 'Full Name', filterable: true, sortable: true },
        { id: 'email', caption: 'Email Address', filterable: true },
        { id: 'status', caption: 'Status', filterable: true, sortable: true }
    ]
});
```

### Advanced Configuration

```javascript
const tableManager = new TableManager('advanced-table', {
    data: userData,
    dataMode: 'server', // 'client' or 'server'
    rowsPerPage: 15,
    maxPageButtons: 7,
    emptyMessage: "No users found.",
    
    columns: [
        { 
            id: 'avatar', 
            caption: 'Photo', 
            size: 60, 
            align: 'center',
            render: (row) => `<img src="${row.avatar}" alt="Avatar" style="width: 40px; border-radius: 50%;">`
        },
        { id: 'firstName', caption: 'First Name', filterable: true, sortable: true },
        { id: 'lastName', caption: 'Last Name', filterable: true, sortable: true },
        { id: 'email', caption: 'Email', filterable: true, size: 200 },
        { 
            id: 'role', 
            caption: 'Role', 
            filterable: true, 
            sortable: true,
            render: (row) => `<span class="badge badge-${row.role.toLowerCase()}">${row.role}</span>`
        },
        { id: 'lastLogin', caption: 'Last Login', sortable: true, type: 'date' }
    ],
    
    actions: [
        {
            id: 'view',
            icon: '<svg>...</svg>',
            title: 'View Details',
            handler: 'viewUser',
            type: 'button'
        },
        {
            id: 'edit',
            icon: '<svg>...</svg>',
            title: 'Edit User',
            handler: 'editUser',
            type: 'button'
        },
        {
            id: 'profile',
            icon: '<svg>...</svg>',
            title: 'View Profile',
            href: (row) => `/profile/${row.id}`,
            type: 'link'
        }
    ],
    
    // Server-side callback
    onStateChange: (state) => {
        fetchDataFromServer(state.page, state.filters, state.sorters);
    }
});
```

## 🏗️ Architecture

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Source   │───▶│   TableManager   │───▶│   HTML Output   │
│ (Array/Server)  │    │                  │    │   (DOM Table)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  User Interactions │
                    │ (Filter/Sort/Page) │
                    └──────────────────┘
```

### Component Structure

```
TableManager
├── Data Processing
│   ├── _processData() - Client-side filtering & sorting
│   └── _requestStateUpdate() - Server-side state management
├── Rendering Engine
│   ├── render() - Main orchestration
│   ├── _createHeader() - Table headers
│   ├── _createBody() - Table rows
│   └── _createFooter() - Pagination controls
├── Modal System
│   ├── showFilterModal() - Filter interface
│   ├── showSortModal() - Sorting interface
│   └── _showModal() - Generic modal handler
└── Event Management
    ├── _attachEventListeners() - Pagination clicks
    └── _updateHeaderBadges() - Filter/sort indicators
```

## 📋 Configuration Options

### Core Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | Array | `[]` | Initial dataset |
| `dataMode` | String | `'client'` | `'client'` or `'server'` processing mode |
| `rowsPerPage` | Number | `8` | Records per page |
| `maxPageButtons` | Number | `5` | Maximum pagination buttons shown |
| `emptyMessage` | String | `"No data available."` | Message when no data |
| `onStateChange` | Function | `null` | Server-mode state callback |

### Column Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | String | ✅ | Data field name |
| `caption` | String | ✅ | Column header text |
| `filterable` | Boolean | ❌ | Enable filtering |
| `sortable` | Boolean | ❌ | Enable sorting |
| `size` | Number | ❌ | Fixed width in pixels |
| `align` | String | ❌ | Text alignment (`left`, `center`, `right`) |
| `type` | String | ❌ | Data type (`string`, `number`, `date`) |
| `hide` | Boolean | ❌ | Hide column from display |
| `render` | Function | ❌ | Custom cell renderer |

### Action Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | String | ✅ | Unique action identifier |
| `icon` | String | ✅ | HTML/SVG icon content |
| `title` | String | ✅ | Tooltip text |
| `handler` | String | ❌ | JavaScript function name for buttons |
| `href` | Function | ❌ | URL generator for links |
| `type` | String | ❌ | `'button'` or `'link'` (default: `'button'`) |

## 🔄 Data Modes

### Client-Side Mode

Best for: Small to medium datasets (< 1000 records)

```javascript
const table = new TableManager('container', {
    data: allRecords, // Full dataset loaded upfront
    dataMode: 'client',
    // TableManager handles all filtering, sorting, and pagination
});
```

**Advantages:**
- Instant filtering and sorting
- No server round-trips
- Works offline
- Simple implementation

### Server-Side Mode

Best for: Large datasets (1000+ records)

```javascript
const table = new TableManager('container', {
    data: [], // Empty initially
    dataMode: 'server',
    onStateChange: async (state) => {
        // Fetch data based on current state
        const response = await fetch(`/api/data?page=${state.page}&filters=${JSON.stringify(state.filters)}`);
        const result = await response.json();
        table.updateData(result.data, result.total);
    }
});
```

**Advantages:**
- Handles unlimited data size
- Reduced memory usage
- Faster initial load
- Real-time data updates

## 🎨 Styling System

### CSS Classes Structure

```css
.table-container              /* Main container */
  ├── .table-content-wrapper  /* Scrollable content area */
  │   └── .tickets-table      /* Table element */
  │       ├── thead           /* Table header */
  │       └── tbody           /* Table body */
  └── .table-footer           /* Pagination area */
      └── .pagination-btn     /* Pagination buttons */
          └── .active         /* Current page */

.modal-overlay                /* Modal backdrop */
└── .modal-content            /* Modal container */
    ├── .modal-header         /* Modal header */
    ├── .modal-body           /* Modal content */
    └── .modal-footer         /* Modal actions */
```

### Custom Styling Example

```css
/* Dark theme example */
.table-container {
    background: #1a1a1a;
    color: #fff;
    border: 1px solid #333;
}

.tickets-table th {
    background: #2d2d2d;
    color: #fff;
}

.tickets-table tbody tr:hover {
    background: #333;
}

.pagination-btn.active {
    background: #007bff;
    color: white;
}
```

## 🔧 API Reference

### Public Methods

#### `updateData(newData, totalRecords?)`
Updates the table with new data.

```javascript
// Client mode
table.updateData(newDataArray);

// Server mode
table.updateData(pageData, totalRecordCount);
```

#### `updateFilters(filters)`
Applies new filter configuration.

```javascript
table.updateFilters([
    { column: 'status', relation: 'equals', value: 'active' },
    { column: 'name', relation: 'contains', value: 'john' }
]);
```

#### `updateSorters(sorters)`
Applies new sorting configuration.

```javascript
table.updateSorters([
    { column: 'name', order: 'asc' },
    { column: 'date', order: 'desc' }
]);
```

#### `showFilterModal()`
Displays the filtering interface.

```javascript
document.getElementById('filter-btn').onclick = () => table.showFilterModal();
```

#### `showSortModal()`
Displays the sorting interface.

```javascript
document.getElementById('sort-btn').onclick = () => table.showSortModal();
```

### Filter Relations

| Relation | Description | Example |
|----------|-------------|---------|
| `contains` | Partial match | `"john"` matches `"Johnson"` |
| `equals` | Exact match | `"active"` matches only `"active"` |
| `startsWith` | Prefix match | `"adm"` matches `"admin"` |

## 📱 Responsive Design

The TableManager automatically adapts to different screen sizes:

```css
/* Mobile optimization */
@media (max-width: 768px) {
    .table-content-wrapper {
        overflow-x: auto;
    }
    
    .pagination-btn {
        padding: 0.5rem;
        font-size: 0.875rem;
    }
}
```

## 🛡️ Security Features

### XSS Protection
All user data is automatically escaped:

```javascript
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
```

### Safe Rendering
Custom render functions should handle their own escaping:

```javascript
{
    id: 'description',
    render: (row) => {
        // Safe: escaped content
        return `<div class="description">${escapeHtml(row.description)}</div>`;
        
        // Unsafe: raw HTML
        return `<div class="description">${row.description}</div>`;
    }
}
```

## 🔗 Integration Examples

### With REST APIs

```javascript
class APITableManager {
    constructor() {
        this.table = new TableManager('data-table', {
            dataMode: 'server',
            onStateChange: (state) => this.fetchData(state)
        });
    }
    
    async fetchData(state) {
        try {
            const params = new URLSearchParams({
                page: state.page,
                limit: state.rowsPerPage,
                sort: state.sorters.map(s => `${s.column}:${s.order}`).join(','),
                filter: JSON.stringify(state.filters)
            });
            
            const response = await fetch(`/api/users?${params}`);
            const result = await response.json();
            
            this.table.updateData(result.data, result.total);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    }
}
```

### With Local Storage

```javascript
class LocalStorageTable {
    constructor() {
        const savedData = JSON.parse(localStorage.getItem('tableData') || '[]');
        
        this.table = new TableManager('local-table', {
            data: savedData,
            dataMode: 'client',
            columns: this.getColumns()
        });
    }
    
    saveData(newData) {
        localStorage.setItem('tableData', JSON.stringify(newData));
        this.table.updateData(newData);
    }
}
```

### With Search Functionality

```javascript
class SearchableTable {
    constructor(data) {
        this.originalData = data;
        this.table = new TableManager('searchable-table', {
            data: data,
            dataMode: 'client'
        });
        
        this.setupSearch();
    }
    
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.originalData.filter(item => 
                Object.values(item).some(val => 
                    val.toString().toLowerCase().includes(query)
                )
            );
            this.table.updateData(filtered);
        });
    }
}
```

## 🎯 Use Cases

### Admin Dashboards
- User management
- Order processing
- Content moderation
- System monitoring

### Data Analytics
- Report viewing
- Metric tracking
- Performance analysis
- Trend visualization

### E-commerce
- Product catalogs
- Inventory management
- Customer data
- Transaction history

### CRM Systems
- Contact management
- Lead tracking
- Activity logs
- Communication history

## 📊 Performance Considerations

### Client-Side Mode
- **Memory**: ~1MB per 10,000 records
- **Rendering**: ~50ms for 1,000 records
- **Best for**: < 1,000 records

### Server-Side Mode
- **Memory**: Constant (~100KB)
- **Network**: 1 request per user action
- **Best for**: > 1,000 records

### Optimization Tips

```javascript
// Use custom rendering sparingly
{
    id: 'status',
    render: (row) => row.status, // ❌ Unnecessary
    // vs
    id: 'status' // ✅ Automatic escaping
}

// Optimize column sizing
{
    id: 'id',
    size: 60, // ✅ Fixed width for IDs
    align: 'center'
}

// Smart pagination
rowsPerPage: window.innerHeight > 800 ? 15 : 10 // ✅ Adaptive
```

## 🐛 Troubleshooting

### Common Issues

**Pagination not showing**
```javascript
// Check if totalRecords > rowsPerPage
console.log('Total:', table.totalRecords, 'Per page:', table.config.rowsPerPage);
```

**Filters not working**
```javascript
// Ensure columns have filterable: true
{ id: 'name', caption: 'Name', filterable: true }
```

**Server mode not updating**
```javascript
// Verify onStateChange callback
onStateChange: (state) => {
    console.log('State changed:', state); // Debug output
    // Your fetch logic here
}
```

**Styling issues**
```css
/* Ensure CSS files are loaded in correct order */
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/table.css">
<link rel="stylesheet" href="css/modal.css">
```

## 📄 License

MIT License - feel free to use in any project, commercial or personal.

## 🤝 Contributing

This component is designed to be self-contained and dependency-free. For enhancements:

1. Maintain vanilla JavaScript compatibility
2. Preserve the public API
3. Add comprehensive examples
4. Update this documentation

---

**TableManager** - Your go-to solution for powerful, flexible data tables in any JavaScript project. 🚀