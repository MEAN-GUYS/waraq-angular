import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { LoginPayload } from '../../models/registration';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    loginForm: FormGroup;
    submitted = false;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private notify: NotificationService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
        });
    }

    get f() {
        return this.loginForm.controls;
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            if (this.f['email'].errors) {
                this.notify.show('Please enter a valid email address', 'error');
            } else if (this.f['password'].errors) {
                this.notify.show('Password is required', 'error');
            }
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const payload: LoginPayload = this.loginForm.value;

        this.authService.login(payload).subscribe({
            next: () => {
                this.loading = false;
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
                // prevent //evil.com attacks
                const isSafeUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
                const isAdmin = this.authService.getRole() === 'admin';
                const safeReturnUrl = isSafeUrl ? returnUrl : (isAdmin ? '/admin' : '/');
                this.router.navigateByUrl(safeReturnUrl);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage =
                    err.error?.message ?? 'Login failed. Please check your credentials.';
                this.notify.show(this.errorMessage, 'error');
                this.cdr.detectChanges();
            },
        });
    }
}
