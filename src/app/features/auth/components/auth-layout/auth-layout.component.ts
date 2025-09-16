import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <img class="mx-auto h-16 w-auto" src="assets/logo.svg" alt="Produck CRM" />
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Produck CRM</h2>
          <p class="mt-2 text-sm text-gray-600">Enterprise Customer Relationship Management</p>
        </div>

        <div class="bg-white shadow-xl rounded-lg p-8">
          <router-outlet></router-outlet>
        </div>

        <div class="text-center text-sm text-gray-500">
          <p>&copy; 2024 Produck CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent { }