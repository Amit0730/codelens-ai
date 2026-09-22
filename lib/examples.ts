import { SupportedLanguage } from './types';

export const EXAMPLE_CODE: Record<SupportedLanguage, string> = {
  javascript: `// User authentication service — multiple issues for demo
async function authenticateUser(username, password) {
  // SQL Injection vulnerability
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const result = await db.query(query);

  if (result.length > 0) {
    // Hardcoded secret
    const token = "secret_token_12345";
    localStorage.setItem("auth_token", token);
    return { success: true, token: token };
  }
  return { success: false };
}

// Fetch user data — missing error handling
function fetchUserData(userId) {
  fetch('/api/user/' + userId)
    .then(response => response.json())
    .then(data => {
      var userInfo = data;           // var instead of const
      if (data.role == "admin") {    // loose equality
        console.log("Admin user:", data);
        showAdminPanel(userInfo);
      }
    });
  // No .catch() — unhandled promise rejection
}

// TODO: Add input validation
// FIXME: Password is not being hashed`,

  typescript: `interface User {
  id: number;
  name: string;
  email: string;
  password: string; // TODO: remove plain password from interface
}

class UserService {
  private apiKey = "sk-abc123xyz789secretkey"; // Hardcoded API key

  async getUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    const user = await response.json();
    return user;
  }

  processUsers(users: User[]) {
    var result = [];
    for (var i = 0; i <= users.length; i++) {  // Off-by-one error
      if (users[i].name == "admin") {           // Loose equality
        result.push(users[i]);
      }
    }
    return result;
  }

  deleteUser(id: number) {
    fetch(\`/api/users/\${id}\`, { method: 'DELETE' })
      .then(r => r.json())
      .then(data => console.log("Deleted", data));
    // No error handling
  }
}`,

  python: `import os
import sqlite3

# Hardcoded secrets — critical security risk
DB_PASSWORD = "MyS3cr3tP@ssw0rd"
API_KEY = "sk_live_abcdef123456789"

def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # SQL injection vulnerability
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchone()

def process_data(items=[]):  # Mutable default argument bug
    for item in items:
        try:
            result = 10 / item['value']  # Division by zero risk
        except:  # Bare except — catches everything
            pass

def read_file(filename):
    f = open(filename, 'r')  # File handle never closed
    data = f.read()
    return data

# TODO: Add authentication
print "Starting server..."  # Python 2 syntax in Python 3`,

  java: `import java.sql.*;
import java.util.*;

public class UserManager {
    private static final String DB_PASSWORD = "admin123"; // Hardcoded!

    public User findUser(String username) throws Exception {
        Connection conn = DriverManager.getConnection(
            "jdbc:mysql://localhost/db", "root", DB_PASSWORD
        );

        // SQL injection vulnerability
        String query = "SELECT * FROM users WHERE name = '" + username + "'";
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(query);

        if (rs.next()) {
            User user = new User();
            user.setName(rs.getString("name"));
            return user;
        }
        return null;
    }

    public boolean checkPassword(String input, String stored) {
        return input == stored;  // Bug: use .equals() for Strings
    }

    public void riskyOperation() {
        try {
            performDangerousTask();
        } catch (Exception e) {
            // Empty catch block — silently swallows all errors
        }
    }
}`,

  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Hardcoded password in source
const char* PASSWORD = "admin123";

void readInput() {
    char buffer[64];
    printf("Enter name: ");
    gets(buffer);  // Dangerous: no bounds checking — buffer overflow!
    printf("Hello, %s\\n", buffer);
}

int* createArray(int size) {
    int* arr = malloc(size * sizeof(int));
    // malloc return value not checked for NULL
    for (int i = 0; i <= size; i++) {  // Off-by-one: should be i < size
        arr[i] = i * 2;
    }
    return arr;
    // Memory leak: caller must free but undocumented
}

void divideNumbers(int a, int b) {
    // No check for b == 0 — undefined behavior
    printf("Result: %d\\n", a / b);
}

int main() {
    readInput();
    int* data = createArray(10);
    divideNumbers(10, 0);  // Division by zero crash
    // data is never freed — memory leak
    return 0;
}`,

  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <cstring>

class DatabaseManager {
private:
    std::string password = "secret_db_password_123"; // Hardcoded

public:
    // Raw pointer with no RAII — memory management nightmare
    int* getData(int size) {
        int* buffer = new int[size];
        for (int i = 0; i <= size; i++) {  // Off-by-one error
            buffer[i] = i;
        }
        return buffer;  // Caller must delete[] — memory leak likely
    }

    void processInput(std::string input) {
        char buf[32];
        strcpy(buf, input.c_str());  // Buffer overflow if input > 31 chars
        std::cout << buf << std::endl;
    }
};

int main() {
    DatabaseManager db;
    int* data = db.getData(100);
    // data is never deleted — memory leak

    std::vector<int> v = {1, 2, 3};
    std::cout << v[10] << std::endl;  // Out-of-bounds access (UB)

    return 0;
}`,

  sql: `-- User data access queries with multiple issues

-- SELECT * retrieves all columns unnecessarily
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM products;

-- N+1 style query pattern
SELECT * FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 1;

-- Missing index — full table scan on large table
SELECT * FROM logs WHERE created_at > '2024-01-01' ORDER BY created_at DESC;

-- CRITICAL: UPDATE without WHERE clause — affects ALL rows!
UPDATE users SET password = 'newpassword123';

-- SQL injection via string concatenation (when used in code):
-- query = "SELECT * FROM users WHERE id = " + userId`,

  html: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
    <!-- Missing charset meta, viewport meta, description -->
</head>
<body>
    <!-- Excessive inline styles -->
    <h1 style="color: red; font-size: 24px; margin: 10px;">Welcome</h1>

    <!-- Missing alt attribute — accessibility failure -->
    <img src="photo.jpg">
    <img src="banner.png">
    <img src="avatar.jpg">

    <div style="background: blue; padding: 20px; width: 100%;">
        <p style="color: white; font-weight: bold;">Content here</p>

        <!-- XSS vulnerability: inserting user input as innerHTML -->
        <div id="user-content"></div>
        <script>
            var userInput = location.hash.substring(1);
            document.getElementById('user-content').innerHTML = userInput;
        </script>
    </div>

    <!-- Sensitive data in GET request (appears in URL and server logs) -->
    <form action="/login" method="get">
        <input type="password" name="password" placeholder="Password">
        <input type="submit" value="Login">
    </form>
</body>
</html>`,

  css: `/* Global styles with multiple issues */

/* Overuse of !important — specificity war */
* {
    color: red !important;
    font-size: 16px !important;
}

.button {
    background: blue !important;
    border: none !important;
    padding: 10px !important;
}

/* Magic numbers — no design tokens */
.header {
    height: 67px;
    z-index: 99999;
    margin-top: 23px;
}

/* Non-performant deep selector */
div > div > div > span > a {
    color: green;
}

/* Duplicate rule — .container defined twice */
.container {
    display: flex;
    user-select: none;
    transition: all 0.3s ease;
}

/* Duplicate definition */
.container {
    display: flex;
    max-width: 1200px;
}

/* Unused vendor prefix for modern browsers */
.box {
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
}`,
};
