import { Component } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { RegistrationValidators } from '../../services/registration-validators';
import {RegistrationPayload} from '../../models/registration'


@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {

  registerForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validators: RegistrationValidators
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName:  ['', [Validators.required, Validators.minLength(3)]],
        email:     ['', [Validators.required, this.validators.emailValidator()]],
        dateOfBirth: ['', Validators.required],
        password:  ['', [Validators.required, this.validators.passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required],
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
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload: RegistrationPayload = this.registerForm.value;

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Registered successfully:', res);
        // navigate or show success
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? 'Registration failed. Please try again.';
      },
    });
  }
}