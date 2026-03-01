import { Component } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { RegistrationValidators } from '../../services/registration-validators';
import { RegistrationPayload } from '../../models/registration';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validators: RegistrationValidators,
    private router: Router,
    private notify: NotificationService
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, this.validators.emailValidator()]],
        password: ['', [Validators.required, this.validators.passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required],
        dob: ['', Validators.required],
      },
      { validators: this.validators.passwordMatchValidator() }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      const f = this.f;
      if (f['firstName'].errors) {
        this.notify.show('First name must be at least 3 characters', 'error');
      } else if (f['lastName'].errors) {
        this.notify.show('Last name must be at least 3 characters', 'error');
      } else if (f['email'].errors) {
        this.notify.show('Please enter a valid email address', 'error');
      } else if (f['dob'].errors) {
        this.notify.show('Date of birth is required', 'error');
      } else if (f['password'].errors) {
        this.notify.show('Password must be 8+ characters with at least 1 letter and 1 number', 'error');
      } else if (this.registerForm.errors?.['mismatch']) {
        this.notify.show('Passwords do not match', 'error');
      }
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload: RegistrationPayload = this.registerForm.value;

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? 'Registration failed. Please try again.';
        this.notify.show(this.errorMessage, 'error');
      },
    });
  }
}
