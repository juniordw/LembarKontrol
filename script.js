let services = [];
let filteredServices = [];
const itemsPerPage = 10;
let currentPage = 1;

async function fetchServices() {
    try {
        const response = await fetch('getServices.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

async function initialize() {
    services = await fetchServices();
    filteredServices = [...services];
    renderTable();
    document.getElementById('searchInput').addEventListener('input', filterTable);
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageServices = filteredServices.slice(start, end);

    tableBody.innerHTML = '';
    pageServices.forEach((service, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="No">${start + index + 1}</td>
            <td data-label="Seksi">${service.teams_nama}</td>
            <td data-label="Nama Layanan">${service.layanan_nama}</td>
            <td data-label="Action">
                <button class="action-btn" onclick="showDetails('${service.layanan_id}')">Persyaratan</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const pageCount = Math.ceil(filteredServices.length / itemsPerPage);
    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Previous';
    prevBtn.classList.add('pagination-btn');
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPagination();
        }
    };
    prevBtn.disabled = currentPage === 1;
    pagination.appendChild(prevBtn);

    // Calculate range of page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(pageCount, startPage + 4);
    startPage = Math.max(1, endPage - 4);

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.classList.add('pagination-btn');
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => {
            currentPage = i;
            renderTable();
            renderPagination();
        };
        pagination.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.classList.add('pagination-btn');
    nextBtn.onclick = () => {
        if (currentPage < pageCount) {
            currentPage++;
            renderTable();
            renderPagination();
        }
    };
    nextBtn.disabled = currentPage === pageCount;
    pagination.appendChild(nextBtn);
}

function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredServices = services.filter(service => 
        service.teams_nama.toLowerCase().includes(searchTerm) ||
        service.layanan_nama.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderTable();
}

function showDetails(id) {
    const service = services.find(s => s.layanan_id === id);
    if (!service) return;

    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = service.layanan_nama;
    modalBody.innerHTML = `
        <p><strong>Format Surat:</strong> ${service.layanan_format}</p>
        <p><strong>Janji Layanan:</strong> ${service.layanan_janji}</p>
    <p>
    <strong>Hardcopy:</strong> 
    <span class="status-button ${service.layanan_hardcopy === '2' ? 'status-wajib' : 'status-tidak-wajib'}">
        ${service.layanan_hardcopy === '2' ? 'WAJIB DIAJUKAN' : 'TIDAK WAJIB DIAJUKAN'}
    </span>
</p>
        <h3>Persyaratan:</h3>
        <ol>
            ${service.ceklist_uraian.map(item => `<li>${item}</li>`).join('')}
        </ol>
    `;

    modal.style.display = 'block';

    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
}

// Initialize the script on page load
document.addEventListener('DOMContentLoaded', initialize);
