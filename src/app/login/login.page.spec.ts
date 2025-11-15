import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have cliente as default login type', () => {
    expect(component.selectedLoginType).toBe('cliente');
  });

  it('should change login type', () => {
    const event = {
      detail: { value: 'parceiro' },
    } as CustomEvent;
    component.handleLoginTypeChange(event);
    expect(component.selectedLoginType).toBe('parceiro');
  });

  it('should handle login', () => {
    component.email = 'test@test.com';
    component.password = 'password123';
    spyOn(console, 'log');
    component.handleLogin();
    expect(console.log).toHaveBeenCalledWith('Login:', {
      type: 'cliente',
      email: 'test@test.com',
    });
  });

  it('should not handle login with empty fields', () => {
    component.email = '';
    component.password = '';
    spyOn(console, 'log');
    component.handleLogin();
    expect(console.log).not.toHaveBeenCalled();
  });
});

