import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { HttpClient } from 'selenium-webdriver/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  controlArray: string[];
  private apiConfig = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  createAccount(user) {
    return this.http.post(this.apiConfig + '/auth/register', {
      FirstName: user.firstName,
      LastName: user.lastName,
      Email: user.email,
      Password: user.password,
    });
  }

  inputError(control: AbstractControl) {
    if (control.touched === true || control.dirty === true) {
      const parent = control.get('_parent');

      if (parent instanceof FormGroup &&
        control.errors !== null &&
        control.touched) {
        let controlName: string;
        const controls = parent.controls;

        if (!this.controlArray) {
          this.controlArray = Object.keys(controls);
        }

        const length = this.controlArray.length;

        for (let i = 0; i < length; i++) {

          if (control === controls[this.controlArray[i]]) {
            controlName = this.controlArray[i];
            break;
          }
        }

        const translatedControlName = this.controlNameAdjustSwitch(controlName);
        return this.setErrorString(control, controlName, translatedControlName);
      }
    }
  }

  controlNameAdjustSwitch(controlName: string): string {
    switch (controlName) {
      case 'name':
        controlName = 'imię';
        break;
      case 'surname':
      case 'lastName':
        controlName = 'nazwisko';
        break;
      case 'password':
        controlName = 'hasło';
        break;
      case 'email':
        controlName = 'email';
        break;
    }
    return controlName;
  }

  setErrorString(control: AbstractControl, controlName: string, translatedControlName: string) {
    let errorObj: {
      controlName: string;
      errorStr: string;
    };

    let errorStr: string;

    if (control.value !== undefined && control.value.length === 0) {
      errorStr = 'Wpisz ' + translatedControlName;

    } else {
      if (controlName === 'password' || controlName === 'newPassword') {
        errorStr =
          'Użyj co najmniej ośmiu znaków, w tym jednocześnie liter, cyfr i symboli: !#$%&?';

      } else {
        errorStr = translatedControlName;
      }
    }

    errorObj = {
      errorStr,
      controlName
    };

    return errorObj;
  }

  formGroupControls(formGroup: FormGroup): { [key: string]: AbstractControl } {
    return formGroup.controls;
  }

  setDirty(formGroup: FormGroup): void {
    const formGroupControls = this.formGroupControls(formGroup);
    Object.keys(formGroupControls).forEach(key => {
      formGroupControls[key].markAsTouched();
    });
  }

}
