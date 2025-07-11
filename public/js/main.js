window.addEventListener("DOMContentLoaded", () => {
  //DOMContentLoaded is a browser event that fires when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading. It’s commonly used to ensure that the DOM elements (like buttons, inputs, divs) are available before your JavaScript code tries to interact with them.

//   This part runs after the DOM is fully loaded, meaning:

// document.getElementById(...) will work without throwing a "null" error.

// It checks if a user is logged in by checking for a token in localStorage.

// Based on whether the token exists:

// It shows or hides relevant sections (authSection, expenseSection, paymentSection, etc.).

// It calls fetchExpenses() if the user is authenticated.
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("expenseSection").classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    document.getElementById("paymentSection").classList.remove("hidden"); 


    fetchExpenses();  
  } else {
    // document.getElementById("paymentSection").classList.add("hidden"); 

  }
});

document.getElementById("rowsPerPage").value =
  localStorage.getItem("expense_limit") || 10;

document.getElementById("rowsPerPage").addEventListener("change", (e) => {
  limit = e.target.value;
  localStorage.setItem("expense_limit", limit);
  fetchExpenses(1); // reset to page 1
});




const cashfree = Cashfree({
  mode: "sandbox",
})


document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3000/payments/pay", {
      method: "POST",
    });

    const data = await response.json();
    const paymentSessionId = data.paymentSessionId;
    const orderId = data.orderId;

    let checkoutOptions = {
      paymentSessionId,
      redirectTarget: "_self",
    };

    const result = await cashfree.checkout(checkoutOptions);
    //   const result = await cashfree.checkout({
    // paymentSessionId: paymentSessionId,
    // redirectTarget: "_self",
    // });

    if (result.error) {
      console.log("Popup closed or error during payment:", result.error);
    }

    //     if (result.redirect) {
    //   console.log("Redirection fallback triggered");
    // }

    if (result.paymentDetails) {
      const verifyRes = await fetch(
        `http://localhost:3000/payments/payment-status/${orderId}`
      );
      const verifyData = await verifyRes.json();
      alert("Your payment is " + verifyData.orderStatus);
    }
  } catch (error) {
    console.error("Checkout error::", error);
  }
});




const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboardList = document.getElementById("leaderboardList");

leaderboardBtn.addEventListener("click", async () => {
  // Toggle logic
  const isVisible = !leaderboardSection.classList.contains("hidden");

  if (isVisible) {
    leaderboardSection.classList.add("hidden");
    leaderboardList.innerHTML = ""; // Optional: clear list on hide
  } else {
    await fetchLeaderboard();
    leaderboardSection.classList.remove("hidden");
  }
});

async function fetchLeaderboard() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://localhost:3000/premium/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error);

    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = "";
    data.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `Name: ${entry.name}, Total expense = ₹${entry.totalExpenses}`;
      leaderboardList.appendChild(li);
    });

    const leaderboardSection = document.getElementById("leaderboardSection");
    leaderboardSection.classList.remove("hidden");

  } catch (err) {
    console.error("Failed to refresh leaderboard:", err.message);
  }
}





const signupSection = document.getElementById("signupSection");
const loginSection = document.getElementById("loginSection");
const authSection = document.getElementById("authSection");
const expenseSection = document.getElementById("expenseSection");
const expenseList = document.getElementById("expenseList");
const expenseForm = document.getElementById("expenseForm");
const logoutBtn = document.getElementById("logoutBtn");
const payNowSection = document.getElementById("paymentSection")


document.getElementById("switchToLogin").onclick = () => {
  // here document.getElementById("signupForm") is a DOM element and we are assigning a function to it.
  loginSection.classList.remove("hidden");
  signupSection.classList.add("hidden");
};
document.getElementById("switchToSignup").onclick = () => {
  signupSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
};

document.getElementById("signupForm").onsubmit = async (e) => {
  //onsubmit is the correct event listener for a <form> element.

  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3000/users/signup", {
      // res is the response object returned by fetch().  It contains: Status (res.status), Headers, Body (in a raw stream format)......json() parses the body into usable data

      method: "POST",
      headers: { "Content-Type": "application/json" },  
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json(); // json() parses the body into usable data
    // It returns a Promise that resolves to a JavaScript object
    // So when you write: const data = await res.json();.... we are Waiting for the response body to be read, Parsing the JSON, Storing the result in data (usually an object)

    // {
    //   "msg": "Signup successful",
    //   "token": "abc123xyz"
    // }

    // becomes

    // { msg: "Signup successful", token: "abc123xyz" }

    alert(data.msg);
    // console.log(data.msg);
    if (res.ok) {
      document.getElementById("signupForm").reset();
      signupSection.classList.add("hidden");
      loginSection.classList.remove("hidden");
    }
  } catch (err) {
    alert("Signup error: " + err.message);
  }
};

document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:3000/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data.msg);
    if (res.ok) {
      localStorage.setItem("token", data.token);
      // localStorage is a built-in browser storage that lets you store key-value pairs — permanently (until manually cleared). It persists even if the page is reloaded or the browser is closed.You can store strings only.

      document.getElementById("loginForm").reset();
      authSection.classList.add("hidden");
      expenseSection.classList.remove("hidden");
      logoutBtn.classList.remove("hidden");
      payNowSection.classList.remove("hidden");

      fetchExpenses();
    }
  } catch (err) {
    alert("Login error: " + err.message);
  }
};

let currentPage = 1;

async function fetchExpenses(page = 1) {
  const token = localStorage.getItem("token");
  let limit = localStorage.getItem("expense_limit") || 10;

  try {
    const res = await fetch(
      `http://localhost:3000/expenses/getExpense?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    expenseList.innerHTML = "";

    data.expenses.forEach((exp) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
  <td>${exp.description}</td>
  <td>₹${exp.expenseAmount}</td>
  <td>${exp.category}</td>
  <td>${exp.note || ""}</td>
  <td>
    <button onclick="deleteExpenses(${exp.id})">Delete</button>
    <button onclick='editExpense(${JSON.stringify(exp)})'>Edit</button>
  </td>
`;
      expenseList.appendChild(tr);
    });

    renderPagination(data.totalPages, page);
  } catch (err) {
    console.error("Fetch failed", err);
  }
}

function renderPagination(totalPages, currentPage) {
  const paginationDiv = document.getElementById("paginationControls");
  paginationDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      fetchExpenses(i);
    };
    paginationDiv.appendChild(btn);
  }
}

async function deleteExpenses(id) {
  const token = localStorage.getItem("token");

  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    const res = await fetch(
      `http://localhost:3000/expenses/deleteExpense/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + data.msg + "\n" + data.error);
      return;
    }
    alert(data.msg)
    fetchExpenses()
    fetchLeaderboard()
  } catch (error) {
    alert("Failed to delete expense: " + error.message);
  }
}


let editingId = null;

function editExpense(exp) {
  editingId = exp.id;
  document.getElementById("description").value = exp.description;
  document.getElementById("amount").value = exp.expenseAmount;
  document.getElementById("category").value = exp.category;
  document.getElementById("note").value = exp.note || "";
  
  document.querySelector("#expenseForm button[type='submit']").textContent = "Update Expense";
}




expenseForm.onsubmit = async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const expenseAmount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;
  const token = localStorage.getItem("token");

  const url = editingId
    ? `http://localhost:3000/expenses/editExpense/${editingId}`
    : "http://localhost:3000/expenses/addExpense";

  const method = editingId ? "PUT" : "POST";


  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description, expenseAmount, category, note }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + data.msg + "\n" + data.error);
      return;
    }
    expenseForm.reset();
    fetchExpenses();
    fetchLeaderboard()
  } catch (err) {
    console.error("Add failed", err);
  }
};

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

const forgotPasswordSection = document.getElementById("forgotPasswordSection");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");
// const loginSection = document.getElementById("loginSection");

// Show Forgot Password Form
forgotPasswordBtn.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  forgotPasswordSection.classList.remove("hidden");
});

// Back to login
backToLoginBtn.addEventListener("click", () => {
  forgotPasswordSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// Handle forgot password form submit
document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value;

    try {
      const res = await axios.post(
        "http://localhost:3000/password/forgotpassword",
        { email }
      );
      alert(res.data.msg || "Reset email sent!");
      document.getElementById("forgotPasswordForm").reset();
      forgotPasswordSection.classList.add("hidden");
      loginSection.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      alert("Failed to send reset email.");
    }
  });

document.getElementById("downloadBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token")
  try {
    const res = await fetch("http://localhost:3000/expenses/download", {
      headers: { Authorization: `Bearer ${token}` },
    });
    //     const data = await res.json();
    //     if (!res.ok) throw new Error(data.msg || "Download failed");
    //     // Show URL or trigger download
    //     const link = document.createElement("a");
    //     link.href = data.fileURL;
    //     link.download = "expense-report.csv";
    //     link.click();
    //   } catch (err) {
    //     console.error("Download failed:", err);
    //     alert(err.message);    }
    // });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.msg || "Download failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert(err.message);
  }
});

document.getElementById("viewReportBtn").addEventListener("click", () => {
  document.getElementById("reportFrame").src = "/frontend";
  document.getElementById("reportFrame").classList.remove("hidden");
});
