import React from "react";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Rank It Pro Platform</h1>
      <p>Your platform is now loading successfully!</p>
      <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h2>Login</h2>
        <form>
          <div style={{ marginBottom: "10px" }}>
            <label>Email:</label>
            <input type="email" placeholder="Enter your email" style={{ width: "100%", padding: "5px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Password:</label>
            <input type="password" placeholder="Enter your password" style={{ width: "100%", padding: "5px" }} />
          </div>
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}>
            Login
          </button>
        </form>
        <div style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
          <p><strong>Test Accounts:</strong></p>
          <p>Super Admin: superadmin@example.com / admin123</p>
          <p>Company Admin: admin@testcompany.com / company123</p>
          <p>Technician: tech@testcompany.com / tech1234</p>
        </div>
      </div>
    </div>
  );
}

export default App;