import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, NgForm } from '@angular/forms';
import { User } from '../Models/user.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  userForm: FormGroup;
  user: User;
  firstName: AbstractControl;
  lastName: AbstractControl;
  email: AbstractControl;
  password: AbstractControl;
  passwordConfirm: AbstractControl;

  loading = true;

  firstNameError: string;
  lastNameError: string;
  emailError: string;
  passwordError: string;
  passwordConfirmError: string;

  registrationError = false;
  registrationErrorMessage: string[];

  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
  firstNamePattern = /^([a-zA-ZąęćłóśźżĄĘĆŁÓŚŹŻ\\']){0,}$/;
  lastNamePattern = /^([a-zA-ZąęćłóśźżĄĘĆŁÓŚŹŻ]+[\s\-\\'])*[a-zA-ZąęćłóśźżĄĘĆŁÓŚŹŻ]+$/;

  constructor(private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit() {

    this.userForm = this.fb.group({

      firstName: ['', Validators.compose([
        Validators.required,
        Validators.pattern(this.firstNamePattern)
      ])
      ],

      lastName: ['', Validators.compose([
        Validators.required,
        Validators.pattern(this.lastNamePattern)
      ])
      ],

      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])
      ],

      password: ['', Validators.compose([
        Validators.required,
        Validators.pattern(this.passwordPattern)
      ])
      ],

      passwordConfirm: ['', Validators.compose([
        Validators.required,
        this.matchPassword
      ])
      ],

    });

    this.firstName = this.userForm.get('firstName');
    this.lastName = this.userForm.get('lastName');
    this.email = this.userForm.get('email');
    this.password = this.userForm.get('password');
    this.passwordConfirm = this.userForm.get('passwordConfirm');
  }

  onSubmit(): void {

    if (this.userForm.invalid) {
      this.setDirty();
      return;
    }

    this.loading = true;
    this.createUser();
    this.authService.createAccount(this.user).subscribe(
      data => {
        // navigate by Url => auth/login
      },
      error => {
        this.loading = false;
        this.registrationError = true;
        this.registrationErrorMessage = error;
      }
    );

  }

  setDirty(): void {
    this.authService.setDirty(this.userForm);
  }

  createUser(): void {
    // this.user = new User();
    this.user.firstName = this.firstName.value;
    this.user.lastName = this.lastName.value;
    this.user.email = this.email.value;
    this.user.password = this.password.value;
  }

  setAllAsTouched(): void {
    this.firstName.markAsTouched();
    this.lastName.markAsTouched();
    this.email.markAsTouched();
    this.password.markAsTouched();
    this.passwordConfirm.markAsTouched();
  }

  setAllAsUntouched(): void {
    this.firstName.markAsUntouched();
    this.lastName.markAsUntouched();
    this.email.markAsUntouched();
    this.password.markAsUntouched();
    this.passwordConfirm.markAsUntouched();
  }

  onFocus(control: AbstractControl): void {
    control.markAsUntouched();
    this.registrationError = false;
  }

  onBlur(control: AbstractControl): void {
    if (control.dirty === false) {
      control.markAsUntouched();
      this.registrationError = false;
    }
  }

  clearPasswordConfirm(): void {
    this.passwordConfirm.setValue('');
    this.passwordConfirm.markAsUntouched();
  }


  inputError(control: AbstractControl): boolean {
    const errorObj = this.authService.inputError(control);

    if (errorObj) {
      switch (errorObj.controlName) {
        case 'name':
          this.firstNameError = errorObj.errorStr;
          break;
        case 'last name':
          this.lastNameError = errorObj.errorStr;
          break;
        case 'email':
          this.emailError = errorObj.errorStr;
          break;
        case 'password':
          this.passwordError = errorObj.errorStr;
          break;
      }

      return true;
    }
  }

  matchPassword(control: AbstractControl): { [s: string]: boolean } {
    if (control.parent !== undefined) {
      const password = control.parent.get('password').value;
      const passwordConfirm = control.parent.get('passwordConfirm').value;
      if (password !== passwordConfirm) {
        return { noMatch: true };
      }
    }
  }

  passwordNoMatch(): boolean {
    if (this.passwordConfirm.errors) {
      if (this.passwordConfirm.errors.noMatch === undefined) {
        this.passwordConfirmError = 'Passwords do not match';
        return true;
      }
    } else {
      return false;
    }
  }
}
