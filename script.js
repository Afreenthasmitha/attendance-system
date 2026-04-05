const API = "http://127.0.0.1:5000";

let currentUser = localStorage.getItem("user") || "";

/* 🔔 Toast Notification */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/* 🔐 Login Function */
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showToast("Please enter all fields", "error");
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.status === "success") {
            currentUser = username;
            localStorage.setItem("user", username);
            showToast("Login successful ✅");
            updateUI();
        } else {
            showToast("Invalid credentials ❌", "error");
        }

    } catch (err) {
        showToast("Server error ⚠️", "error");
        console.error(err);
    }
}

/* 🚪 Logout */
function logout() {
    currentUser = "";
    localStorage.removeItem("user");
    showToast("Logged out");
    updateUI();
}

/* 🕒 Mark Attendance */
async function markAttendance() {
    if (!currentUser) {
        showToast("Please login first", "error");
        return;
    }

    try {
        const btn = document.querySelector("#markBtn");
        btn.disabled = true;
        btn.innerText = "Marking...";

        const res = await fetch(`${API}/attendance`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username: currentUser })
        });

        const data = await res.json();

        showToast(data.message || "Attendance marked");
        getRecords();

    } catch (err) {
        showToast("Failed to mark attendance", "error");
    } finally {
        const btn = document.querySelector("#markBtn");
        btn.disabled = false;
        btn.innerText = "Mark Attendance";
    }
}

/* 📊 Fetch Records */
async function getRecords() {
    try {
        const res = await fetch(`${API}/records`);
        const data = await res.json();

        const list = document.getElementById("records");
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<li>No records found</li>";
            return;
        }

        data.reverse().forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${item.username}</strong>
                <br>
                <small>${item.time}</small>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        showToast("Error fetching records", "error");
    }
}

/* 🧠 UI Control */
function updateUI() {
    const loginSection = document.getElementById("loginSection");
    const appSection = document.getElementById("appSection");

    if (currentUser) {
        loginSection.style.display = "none";
        appSection.style.display = "block";
        document.getElementById("welcome").innerText = `Welcome, ${currentUser}`;
        getRecords();
    } else {
        loginSection.style.display = "block";
        appSection.style.display = "none";
    }
}

/* 🚀 Auto Load */
window.onload = () => {
    updateUI();
};
