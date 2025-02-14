const apiUrl = "https://dummyjson.com/users"; 
const tableBody = document.getElementById("table-body");
const loadingIndicator = document.getElementById("loading");

let currentOffset = 0;
const limit = 15; 
let hasMoreData = true;
let isFetching = false;


async function fetchUsers(skip, limit) {
    try {
        loadingIndicator.style.display = "block";
        console.time("fetchUsers");
        const response = await fetch(`${apiUrl}?skip=${skip}&limit=${limit}`);
        console.timeEnd("fetchUsers");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    } finally {
        loadingIndicator.style.display = "none";
    }
}

function appendUsersToTable(users) {
    const fragment = document.createDocumentFragment();
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.gender}</td>
            <td>${user.address.city}</td>
            <td>${user.phone}</td>
            <td>${user.address.postalCode || 'N/A'}</td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}

async function loadMoreUsers() {
    if (!hasMoreData || isFetching) return;
    isFetching = true;
    
    const users = await fetchUsers(currentOffset, limit);
    if (users.length === 0) {
        hasMoreData = false;
        return;
    }
    
    appendUsersToTable(users);
    currentOffset += limit;
    isFetching = false;
}

let debounceTimeout;
window.addEventListener("scroll", () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        if (!isFetching) {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                loadMoreUsers();
            }
        }
    }, 200); 
});

if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadMoreUsers());
} else {
    loadMoreUsers();
}
