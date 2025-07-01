/**
 * Tests de la página de Login
 * Estos tests cubren la interfaz de usuario y funcionalidad de login
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../app/login/page';

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock de Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

describe('LoginPage Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockPush.mockClear();
    localStorage.clear();
  });

  const renderLoginPage = () => {
    return render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
  };

  describe('UI Elements and Initial State', () => {
    test('should render all form elements correctly (OK)', () => {
      renderLoginPage();

      // Verificar título
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      
      // Verificar campos del formulario
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      
      // Verificar botones
      expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
      expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
      
      // Verificar enlaces
      expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();
      expect(screen.getByText('Volver a la Tienda')).toBeInTheDocument();
      
      // Verificar checkbox
      expect(screen.getByLabelText('Recordarme')).toBeInTheDocument();
    });

    test('should have empty form fields initially (OK NO DATA)', () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');

      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });

    test('should not show error message initially (OK NO DATA)', () => {
      renderLoginPage();

      // No debería mostrar mensaje de error al inicio
      expect(screen.queryByText('Credenciales incorrectas')).not.toBeInTheDocument();
    });

    test('should show password toggle button (OK)', () => {
      renderLoginPage();

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Form Input Functionality', () => {
    test('should update email field when typing (OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('should update password field when typing (OK)', async () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText('Contraseña');
      
      await user.type(passwordInput, 'testpassword');
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    test('should toggle password visibility (OK)', async () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText('Contraseña');
      const toggleButton = passwordInput.parentElement?.querySelector('button');

      // Inicialmente debería ser tipo password
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Hacer click en toggle
      if (toggleButton) {
        await user.click(toggleButton);
      }
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Hacer click de nuevo para ocultar
      if (toggleButton) {
        await user.click(toggleButton);
      }
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should handle special characters in inputs (OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await user.type(emailInput, 'test+tag@domain.co.uk');
      await user.type(passwordInput, 'P@ssw0rd!123');
      
      expect(emailInput).toHaveValue('test+tag@domain.co.uk');
      expect(passwordInput).toHaveValue('P@ssw0rd!123');
    });
  });

  describe('Form Validation and Submission', () => {
    test('should require email field (NOT OK)', async () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      const passwordInput = screen.getByLabelText('Contraseña');
      
      // Llenar solo la contraseña
      await user.type(passwordInput, 'password123');
      
      // Intentar submit sin email
      await user.click(submitButton);
      
      // El navegador debería validar el campo requerido
      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      expect(emailInput).toBeInvalid();
    });

    test('should require password field (NOT OK)', async () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      
      // Llenar solo el email
      await user.type(emailInput, 'test@example.com');
      
      // Intentar submit sin password
      await user.click(submitButton);
      
      // El navegador debería validar el campo requerido
      const passwordInput = screen.getByLabelText('Contraseña');
      expect(passwordInput).toBeInvalid();
    });

    test('should login successfully with valid credentials (OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      // Llenar credenciales válidas
      await user.type(emailInput, 'diego@duoc.cl');
      await user.type(passwordInput, 'password123');

      // Submit del formulario
      await act(async () => {
        await user.click(submitButton);
      });

      // Debería redirigir a la página principal
      expect(mockPush).toHaveBeenCalledWith('/');
      
      // No debería mostrar error
      expect(screen.queryByText('Credenciales incorrectas')).not.toBeInTheDocument();
    });

    test('should show error with invalid credentials (NOT OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      // Llenar credenciales inválidas
      await user.type(emailInput, 'wrong@email.com');
      await user.type(passwordInput, 'wrongpassword');

      // Submit del formulario
      await act(async () => {
        await user.click(submitButton);
      });

      // Debería mostrar error
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
      
      // No debería redirigir
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should handle empty form submission (OK NO DATA)', async () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      // Intentar submit con campos vacíos
      await user.click(submitButton);

      // Los campos deberían ser inválidos por HTML5 validation
      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');
      
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
      
      // No debería redirigir
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should clear error message when typing (OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      // Generar error primero
      await user.type(emailInput, 'wrong@email.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Verificar que el error está presente
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();

      // Comenzar a escribir de nuevo
      await user.clear(emailInput);
      await user.type(emailInput, 'new@email.com');

      // El error debería haberse limpiado
      expect(screen.queryByText('Credenciales incorrectas')).not.toBeInTheDocument();
    });
  });

  describe('Navigation and Links', () => {
    test('should have correct register link (OK)', () => {
      renderLoginPage();

      const registerLink = screen.getByText('Regístrate aquí');
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });

    test('should have correct store link (OK)', () => {
      renderLoginPage();

      const storeLink = screen.getByText('Volver a la Tienda');
      expect(storeLink.closest('a')).toHaveAttribute('href', '/');
    });

    test('should have forgot password link (OK)', () => {
      renderLoginPage();

      const forgotPasswordLink = screen.getByText('¿Olvidaste tu contraseña?');
      expect(forgotPasswordLink).toHaveAttribute('href', '#');
    });
  });

  describe('Accessibility and UX', () => {
    test('should have proper form labels and accessibility (OK)', () => {
      renderLoginPage();

      // Verificar labels
      const emailInput = screen.getByLabelText('Correo Electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toBeRequired();
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toBeRequired();
    });

    test('should have proper ARIA attributes (OK)', () => {
      renderLoginPage();

      // Verificar que los mensajes de error tengan role="alert"
      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      expect(emailInput).toHaveAttribute('placeholder', 'tu@email.com');
      expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('should handle form submission with enter key (OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');

      // Llenar formulario
      await user.type(emailInput, 'diego@duoc.cl');
      await user.type(passwordInput, 'password123');

      // Presionar Enter en el campo de contraseña
      await user.keyboard('{Enter}');

      // Debería redirigir
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Integration Tests - Complete Login Flow', () => {
    test('should handle complete successful login flow (OK)', async () => {
      renderLoginPage();

      // Estado inicial
      expect(screen.queryByText('Credenciales incorrectas')).not.toBeInTheDocument();

      // Llenar formulario
      await user.type(screen.getByRole('textbox', { name: /correo electrónico/i }), 'diego@duoc.cl');
      await user.type(screen.getByLabelText('Contraseña'), 'password123');

      // Marcar checkbox "Recordarme"
      await user.click(screen.getByLabelText('Recordarme'));

      // Enviar formulario
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
      });

      // Verificar resultado
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(screen.queryByText('Credenciales incorrectas')).not.toBeInTheDocument();
    });

    test('should handle complete failed login flow (NOT OK)', async () => {
      renderLoginPage();

      // Llenar formulario con credenciales incorrectas
      await user.type(screen.getByRole('textbox', { name: /correo electrónico/i }), 'fake@email.com');
      await user.type(screen.getByLabelText('Contraseña'), 'wrongpassword');

      // Enviar formulario
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
      });

      // Verificar que muestra error y no redirige
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();

      // Intentar corregir las credenciales
      await user.clear(screen.getByRole('textbox', { name: /correo electrónico/i }));
      await user.clear(screen.getByLabelText('Contraseña'));
      
      await user.type(screen.getByRole('textbox', { name: /correo electrónico/i }), 'diego@duoc.cl');
      await user.type(screen.getByLabelText('Contraseña'), 'password123');

      // El error debería haber desaparecido
      expect(screen.queryByText('Credenciales incorrectas')).not.toBeInTheDocument();

      // Enviar de nuevo
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
      });

      // Ahora debería funcionar
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    test('should maintain form state during interactions (OK)', async () => {
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText('Contraseña');

      // Llenar formulario parcialmente
      await user.type(emailInput, 'partial@email.com');
      await user.type(passwordInput, 'partial');

      // Interactuar con otros elementos
      await user.click(screen.getByLabelText('Recordarme'));
      await user.click(screen.getByText('¿Olvidaste tu contraseña?'));

      // Los valores deberían mantenerse
      expect(emailInput).toHaveValue('partial@email.com');
      expect(passwordInput).toHaveValue('partial');
      expect(screen.getByLabelText('Recordarme')).toBeChecked();
    });
  });
});
