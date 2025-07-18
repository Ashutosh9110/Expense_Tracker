const signupSection = document.getElementById("signupSection");
const loginSection = document.getElementById("loginSection");
const authSection = document.getElementById("authSection");
const expenseSection = document.getElementById("expenseSection");
const expenseList = document.getElementById("expenseList");
const expenseForm = document.getElementById("expenseForm");
const logoutBtn = document.getElementById("logoutBtn");
const paymentSection = document.getElementById("paymentSection")
const forgotPasswordSection = document.getElementById("forgotPasswordSection");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");



window.addEventListener("DOMContentLoaded", () => {



      const token = localStorage.getItem("token");
  
  if (token) {
    const decodedToken = parseJwt(token);
    // console.log("Token on DOM load:", decodedToken); 
    authSection.classList.add("hidden")  
    expenseSection.classList.remove("hidden")
    logoutBtn.classList.remove("hidden")
    
    const localPremium = localStorage.getItem("isPremiumUser");

     if (decodedToken.isPremium || localPremium === "true") {
      showPremiumUI()
      } else{
        paymentSection.classList.remove("hidden")
      }
      fetchExpenses()
    } else {
      paymentSection.classList.add("hidden")
    }
});



function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const token = localStorage.getItem("token");
const decoded = token && parseJwt(token);
if (decoded?.isPremium) {
  showPremiumUI();
}



document.getElementById("rowsPerPage").value = localStorage.getItem("expense_limit") || 5
document.getElementById("rowsPerPage").addEventListener("change", (e) => { 
  limit = e.target.value 
  localStorage.setItem("expense_limit", limit)
  fetchExpenses(1)
})




const cashfree = Cashfree({
  mode: "sandbox",
})


document.getElementById("renderBtn").addEventListener("click", async () => {
  const oldToken = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:3000/payments/pay", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oldToken}`,
      },
    });

    const { paymentSessionId, orderId } = await response.json();

    let checkoutOptions = {
      paymentSessionId,
      redirectTarget: "_self",
    };

    const result = await cashfree.checkout(checkoutOptions);

    if (result.paymentDetails) {
      const verifyRes = await fetch(
        `http://localhost:3000/payments/payment-status/${orderId}`,
        {
          headers: { Authorization:`Bearer ${oldToken}`},
        }
      );

      const verifyData = await verifyRes.json();
      if (verifyData.isPremium && verifyData.token) {
        localStorage.setItem("token", verifyData.token);   
        localStorage.setItem("isPremiumUser", "true");    
        const decoded  = parseJwt(verifyData.token);
        if (decoded.isPremium) {
          showPremiumUI(); 
          alert("You are a premium user now!");
        } else {
        }
      }
     const statusRes = await fetch("http://localhost:3000/users/status", {
      headers: {
        Authorization:`Bearer ${localStorage.getItem("token")}`
      },
    });
    

const statusData = await statusRes.json();

if (statusData.isPremium) {
  localStorage.setItem("isPremiumUser", "true");
  showPremiumUI();
  alert("You are a premium user!");
}

    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Something went wrong. Please try again.");
  }
});




const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboardList = document.getElementById("leaderboardList");

leaderboardBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const decodedToken = parseJwt(token);

  // Checking if user is premium
  if (!decodedToken.isPremium) {
    alert("To access leaderboard, please buy premium membership");
    return;
  }
  // Toggle logic
  const isVisible = !leaderboardSection.classList.contains("hidden");

  if (isVisible) {
    leaderboardSection.classList.add("hidden");
    leaderboardList.innerHTML = ""; 
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








document.getElementById("switchToLogin").onclick = () => {
  loginSection.classList.remove("hidden");
  signupSection.classList.add("hidden");
};
document.getElementById("switchToSignup").onclick = () => {
  signupSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
};

document.getElementById("signupForm").onsubmit = async (e) => {

  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3000/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },  
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json()


    alert(data.msg)
    // console.log(data.msg)
    if (res.ok) {
      document.getElementById("signupForm").reset()
      signupSection.classList.add("hidden")
      loginSection.classList.remove("hidden")
    }
  } catch (err) {
    alert("Signup error: " + err.message)
  }
};

document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  try {
    const res = await fetch("http://localhost:3000/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json()
    alert(data.msg);
    if (res.ok) {
      localStorage.setItem("token", data.token);

      const decoded = parseJwt(data.token);
      if (decoded.isPremium) {
        localStorage.setItem("isPremiumUser", "true")
        showPremiumUI()
      }else {
        paymentSection.classList.remove("hidden") 
      }
      document.getElementById("loginForm").reset();
      authSection.classList.add("hidden");
      expenseSection.classList.remove("hidden");
      logoutBtn.classList.remove("hidden");
      fetchExpenses();
    }
  } catch (err) {
    alert("Login error: " + err.message);
  }
};



let currentPage = 1;
async function fetchExpenses(page = 1) {
  const token = localStorage.getItem("token");
  let limit = localStorage.getItem("expense_limit") || 5

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
      tr.innerHTML = 
  `<td>${exp.description}</td>
  <td>₹${exp.expenseAmount}</td>
  <td>${exp.category}</td>
  <td>${exp.note || ""}</td>
  <td>
    <button onclick="deleteExpenses(${exp.id})">Delete</button>
    <button onclick='editExpense(${JSON.stringify(exp)})'>Edit</button>
  </td>`

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
  localStorage.clear()
  location.reload()
});




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



function isPremiumUser() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  const decoded = parseJwt(token);
  return decoded.isPremium
}



function showPremiumUI() {
  document.getElementById("premiumBanner").classList.remove("hidden");
  paymentSection.classList.add("hidden");
}