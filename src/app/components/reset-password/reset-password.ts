import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { NotificationService } from '../../services/notification.service';
import { RegistrationValidators } from '../../services/registration-validators';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  form: FormGroup;
  submitted = false;
  loading = false;
  resetSuccess = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService,
    private validators: RegistrationValidators
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.form = this.fb.group(
      {
        password: ['', [Validators.required, this.validators.passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.validators.passwordMatchValidator() }
    );
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.token) {
      this.notify.show('Invalid or missing reset token', 'error');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.f['password'].errors) {
        this.notify.show('Password must be 8+ characters with at least 1 letter and 1 number', 'error');
      } else if (this.form.errors?.['mismatch']) {
        this.notify.show('Passwords do not match', 'error');
      }
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.loading = false;
        this.notify.show('Password reset successfully!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.notify.show(err.error?.message ?? 'Reset failed. The link may have expired.', 'error');
      },
    });
  }
}
