import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Produck CRM Login</h2>
        <form (submit)="onLogin($event)">
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="admin@produck.com" readonly>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" value="admin123" readonly>
          </div>
          <button type="submit" class="login-btn">Sign In</button>
        </form>
        <p class="demo-text">Demo credentials are pre-filled</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      box-sizing: border-box;
    }

    .login-btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .login-btn:hover {
      background: #5a6fd8;
    }

    .demo-text {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 15px;
    }
  `]
})
export class SimpleLoginComponent {
  constructor(private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault();
    // Mock login - redirect to dashboard
    this.router.navigate(['/dashboard']);
  }
}