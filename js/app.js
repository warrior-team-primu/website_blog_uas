// API URL
const apiUrl = 'https://primdev.alwaysdata.net/api/blog';
const apiBaseUrl = 'https://primdev.alwaysdata.net/api';

// Elements for Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const blogsList = document.getElementById('blogsList');
const logoutBtn = document.createElement('button');
logoutBtn.textContent = "Logout";

let userToken = localStorage.getItem('token');  // Check for a token in localStorage

document.addEventListener('DOMContentLoaded', function() {
    // Periksa jika token ada di localStorage
    console.log('ini adalah token', userToken)
    if (userToken) {
        // Jika sudah login, sembunyikan login/register button dan tampilkan logout button
        document.getElementById('addBlogBtn').style.display = 'block';
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';

        fetchBlogs();
    } else {
        fetchBlogs();
        showLoginSection();
        document.getElementById('addBlogBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('registerBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
    }

    // Toggle Navbar on mobile
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Show Register Section
    document.getElementById('registerBtn').addEventListener('click', () => {
        showRegisterSection();
    });

    // Show Login Section
    document.getElementById('loginBtn').addEventListener('click', () => {
        showLoginSection();
    });
});


// Login function
async function handleLogin(email, password) {
    if (!email || !password) {
        loginError.textContent = 'Please fill out all fields';
        return;
    }

    try {
        const res = await fetch(`${apiBaseUrl}/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: new URLSearchParams({ email, password }),
        });

        const data = await res.json();
        console.log(data)
        if (data.token) {
            // Setelah login sukses
            alert('Login successful!');
            localStorage.setItem('token', data.token);  // Save token
            userToken = data.token;

            // Update UI
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('registerBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'block';

            loginSection.style.display = 'none';
            fetchBlogs();  // Ambil data blog setelah login

        } else {
            console.log('masuk ek sini')
            alert(data.message);
        }
    } catch (error) {
        alert(data.message);
    }
}

// Register function
// Register function
async function handleRegister(name, email, password, confirmPassword) {
    const registerError = document.getElementById("registerError");

    // Reset the error message visibility on every new attempt
    registerError.classList.remove("visible");
    registerError.textContent = '';

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
        registerError.textContent = 'Please fill out all fields.';
        registerError.classList.add("visible");
        return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        registerError.textContent = 'Please enter a valid email address.';
        registerError.classList.add("visible");
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match.';
        registerError.classList.add("visible");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);

    // Log the payload to check what is being sent
    console.log('Registering with:', formData);

    try {
        const res = await fetch(`${apiBaseUrl}/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
        });

        console.log('Response status:', res.status, res.ok);
        const data = await res.json();
        console.log('Response data:', data);

        if (data.token) {
            alert('Registration successful!');
            showLoginSection();
        } else {
            registerError.textContent = data.message || 'An error occurred during registration.';
            registerError.classList.add("visible");
        }
    } catch (error) {
        console.error(error);  // Log the error for debugging
        registerError.textContent = 'An error occurred. Please try again later.';
        registerError.classList.add("visible");
    }
}


// Form Submit - Login
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleLogin(loginEmail.value, loginPassword.value);
});

// Form Submit - Register
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleRegister(registerName.value, registerEmail.value, registerPassword.value, confirmPassword.value);
});

// Show login section
function showLoginSection() {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
}

// Show register section
function showRegisterSection() {
    registerSection.style.display = 'block';
    loginSection.style.display = 'none';
}

// Fetch Blogs from API (after login)
async function fetchBlogs() {
    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            }
        });
        const blogs = await res.json();
        displayBlogs(blogs);
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }
}

// Display Blogs on the page
function displayBlogs(blogs) {
    blogsList.innerHTML = blogs.map(blog => `
        <div class="blog-item">
            <h3>${blog.title}</h3>
            <p>${blog.content.substring(0, 150)}...</p>
            <!-- Tampilkan tombol Update dan Delete hanya jika pengguna login -->
            ${userToken ? `
                <a href="#" class="cta-btn" onclick="showUpdateForm(${blog.id}, '${blog.title}', '${blog.content}')">Update</a>
                <a href="#" class="cta-btn" onclick="deleteBlog(${blog.id})">Delete</a>
            ` : ''}
        </div>
    `).join('');
}


// Menampilkan Form untuk menambah blog
function showAddBlogForm() {
    if (!userToken) {
        alert('You must be logged in to add a blog.');
        return;
    }

    const addBlogForm = `
        <div id="addBlogForm">
            <h2>Add Blog</h2>
            <input type="text" id="newBlogTitle" placeholder="Title" required>
            <textarea id="newBlogContent" placeholder="Content" required></textarea>
            <button onclick="addBlog()">Submit</button>
            <button onclick="hideAddBlogForm()">Cancel</button>
        </div>
    `;

    document.getElementById('blogsList').innerHTML = addBlogForm;
    document.getElementById('addBlogBtn').style.display = 'none';
}

// Menyembunyikan Form setelah submit atau cancel
function hideAddBlogForm() {
    document.getElementById('addBlogForm').remove();
    document.getElementById('addBlogBtn').style.display = 'block';
    fetchBlogs();
}

// Add Blog
async function addBlog() {
    if (!userToken) {
        alert('You must be logged in to add a blog.');
        return;
    }

    const title = document.getElementById('blogTitle').value;
    const content = document.getElementById('blogContent').value;
    const image = document.getElementById('blogImage').files[0]; // Get image file

    // Validasi input
    if (!title || !content || !image) {
        alert('Please fill out all fields and select an image.');
        return;
    }

    // Membuat FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image);

    try {
        const res = await fetch(`${apiBaseUrl}/blog/store`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: formData,
        });

        const data = await res.json();
        console.log(data)
        if (data) {
            alert('Blog added successfully');
            fetchBlogs();  // Refresh the blog list
        } else {
            alert('Error adding blog');
        }
    } catch (error) {
        alert('An error occurred while adding the blog');
        console.error(error);
    }
}

// Menampilkan Form untuk menambah blog
function showAddBlogForm() {
    document.getElementById('addBlogForm').style.display = 'block';
    document.getElementById('addBlogBtn').style.display = 'none'; // Hide Add Blog button when form is shown
}

// Menyembunyikan Form setelah submit atau cancel
function hideAddBlogForm() {
    document.getElementById('addBlogForm').style.display = 'none';
    document.getElementById('addBlogBtn').style.display = 'block'; // Show Add Blog button again
}

// Form submit - Add Blog
document.getElementById('addBlogForm').addEventListener('submit', (event) => {
    event.preventDefault();
    addBlog();
});

function showUpdateForm(blogId, title, content) {
    document.getElementById('id').value = blogId;
    document.getElementById('title').value = title;
    document.getElementById('content').value = content;
    document.getElementById('updateForm').style.display = 'block';
  }

document.getElementById('updateBlogForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('id').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    updateBlog(id, title, content);
});


// Update Blog
async function updateBlog(blogId, title, content) {
    if (!userToken) {
        alert('You must be logged in to update a blog.');
        return;
    }

    try {
        const res = await fetch(`${apiBaseUrl}/blog/${blogId}`, {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({ title, content }),
        });

        const data = await res.json();
        console.log(data)
        if (data) {
            alert('Blog updated successfully');
            fetchBlogs();  // Refresh the blog list
        } else {
            alert('Error updating blog');
        }
    } catch (error) {
        alert('An error occurred while updating the blog');
        console.error(error);
    }
}

// Delete Blog
async function deleteBlog(blogId) {
    if (!userToken) {
        alert('You must be logged in to delete a blog.');
        return;
    }

    if (confirm('Are you sure you want to delete this blog?')) {
        try {
            const res = await fetch(`${apiBaseUrl}/blog/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                }
            });

            const data = await res.json();

            if (data.message === 'Success') {
                alert('Blog remove success !');
                fetchBlogs();  // Refresh the blog list
                hideAddBlogForm();  // Hide form after success
            } else if (data.message === 'Data not found') {
                alert('Error: Data not found.');
            } else {
                alert('Failed to add blog. Please try again.');
            }

        } catch (error) {
            alert('An error occurred while deleting the blog');
            console.error(error);
        }
    }
}

// Logout function
function handleLogout() {
    // Hapus token dari localStorage
    localStorage.removeItem('token');
    userToken = null;

    // Menyembunyikan tombol logout dan menampilkan tombol login
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('registerBtn').style.display = 'block';

    // Kembali ke halaman login
    alert('You have successfully logged out.');
    showLoginSection();
}

// Event listener untuk tombol logout
document.getElementById('logoutBtn').addEventListener('click', handleLogout);
