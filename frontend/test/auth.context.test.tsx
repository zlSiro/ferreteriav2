/**
 * Tests del AuthContext
 * Estos tests cubren la funcionalidad de autenticación y autorización
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ReactNode, useState } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Componente de prueba para usar el hook useAuth
const TestComponent = () => {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();

  const handleValidLogin = () => {
    login('diego@duoc.cl', 'password123');
  };

  const handleInvalidLogin = () => {
    login('invalid@email.com', 'wrongpassword');
  };

  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="is-admin">{isAdmin.toString()}</div>
      <button data-testid="login-button" onClick={handleValidLogin}>
        Login
      </button>
      <button data-testid="login-invalid-button" onClick={handleInvalidLogin}>
        Login Invalid
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const AuthWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    localStorage.clear();
    user = userEvent.setup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    test('should start with no authenticated user (OK NO DATA)', () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    });

    test('should load user from localStorage on initialization (OK)', () => {
      // Simular usuario guardado en localStorage
      const savedUser = {
        email: 'diego@duoc.cl',
        isAdmin: true
      };
      localStorage.setItem('user', JSON.stringify(savedUser));

      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('diego@duoc.cl');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });

    test('should handle corrupted localStorage data (NOT OK)', () => {
      // Simular datos corruptos en localStorage
      localStorage.setItem('user', 'invalid-json');

      // Mockear console.error para evitar logs en tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // No debería fallar, debería manejar el error gracefully
      expect(() => {
        render(
          <AuthWrapper>
            <TestComponent />
          </AuthWrapper>
        );
      }).not.toThrow();

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');

      consoleSpy.mockRestore();
    });
  });

  describe('Login Functionality', () => {
    test('should login successfully with valid credentials (OK)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      const loginButton = screen.getByTestId('login-button');
      
      await act(async () => {
        await user.click(loginButton);
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('diego@duoc.cl');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      
      // Verificar que se guardó en localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.email).toBe('diego@duoc.cl');
      expect(savedUser.isAdmin).toBe(true);
    });

    test('should fail login with invalid credentials (NOT OK)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      const loginInvalidButton = screen.getByTestId('login-invalid-button');
      
      await act(async () => {
        await user.click(loginInvalidButton);
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
      
      // Verificar que no se guardó nada en localStorage
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('should handle login with empty credentials (OK NO DATA)', async () => {
      const TestEmptyLogin = () => {
        const { login } = useAuth();
        const [result, setResult] = useState<boolean | null>(null);

        const handleEmptyLogin = () => {
          setResult(login('', ''));
        };

        return (
          <div>
            <button data-testid="empty-login-button" onClick={handleEmptyLogin}>
              Empty Login
            </button>
            <div data-testid="login-result">{result !== null ? result.toString() : 'null'}</div>
          </div>
        );
      };

      render(
        <AuthWrapper>
          <TestEmptyLogin />
        </AuthWrapper>
      );

      const emptyLoginButton = screen.getByTestId('empty-login-button');
      await user.click(emptyLoginButton);

      expect(screen.getByTestId('login-result')).toHaveTextContent('false');
    });

    test('should return boolean result for login attempts (OK)', async () => {
      const TestLoginResult = () => {
        const { login } = useAuth();
        const [validResult, setValidResult] = useState<boolean | null>(null);
        const [invalidResult, setInvalidResult] = useState<boolean | null>(null);

        const handleValidLogin = () => {
          setValidResult(login('diego@duoc.cl', 'password123'));
        };

        const handleInvalidLogin = () => {
          setInvalidResult(login('wrong@email.com', 'wrong'));
        };

        return (
          <div>
            <button data-testid="test-valid-login" onClick={handleValidLogin}>
              Test Valid Login
            </button>
            <button data-testid="test-invalid-login" onClick={handleInvalidLogin}>
              Test Invalid Login
            </button>
            <div data-testid="valid-result">{validResult !== null ? validResult.toString() : 'null'}</div>
            <div data-testid="invalid-result">{invalidResult !== null ? invalidResult.toString() : 'null'}</div>
          </div>
        );
      };

      render(
        <AuthWrapper>
          <TestLoginResult />
        </AuthWrapper>
      );

      await user.click(screen.getByTestId('test-valid-login'));
      await user.click(screen.getByTestId('test-invalid-login'));

      expect(screen.getByTestId('valid-result')).toHaveTextContent('true');
      expect(screen.getByTestId('invalid-result')).toHaveTextContent('false');
    });
  });

  describe('Logout Functionality', () => {
    test('should logout successfully and clear state (OK)', async () => {
      // Primero login
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      const loginButton = screen.getByTestId('login-button');
      await act(async () => {
        await user.click(loginButton);
      });

      // Verificar que está logueado
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(localStorage.getItem('user')).not.toBeNull();

      // Hacer logout
      const logoutButton = screen.getByTestId('logout-button');
      await act(async () => {
        await user.click(logoutButton);
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('should handle logout when not logged in (OK NO DATA)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      const logoutButton = screen.getByTestId('logout-button');
      
      // No debería fallar al hacer logout sin estar logueado
      expect(() => {
        user.click(logoutButton);
      }).not.toThrow();

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });

  describe('Authorization (Admin) Tests', () => {
    test('should grant admin access to valid admin user (OK)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      const loginButton = screen.getByTestId('login-button');
      await act(async () => {
        await user.click(loginButton);
      });

      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });

    test('should deny admin access when not logged in (NOT OK)', () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    });

    test('should persist admin status across page reloads (OK)', () => {
      // Simular usuario admin guardado
      const adminUser = {
        email: 'diego@duoc.cl',
        isAdmin: true
      };
      localStorage.setItem('user', JSON.stringify(adminUser));

      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });
  });

  describe('Hook Error Handling', () => {
    test('should throw error when useAuth is used outside AuthProvider (NOT OK)', () => {
      const TestComponentOutsideProvider = () => {
        const auth = useAuth();
        return <div>{auth.isAuthenticated.toString()}</div>;
      };

      // Capturar el error en consola
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests - Complete Auth Flow', () => {
    test('should handle complete authentication flow (OK)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      // Estado inicial
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');

      // Login
      await act(async () => {
        await user.click(screen.getByTestId('login-button'));
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('diego@duoc.cl');

      // Logout
      await act(async () => {
        await user.click(screen.getByTestId('logout-button'));
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    test('should maintain state consistency during rapid operations (OK)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      // Múltiples operaciones rápidas
      await act(async () => {
        await user.click(screen.getByTestId('login-button'));
        await user.click(screen.getByTestId('logout-button'));
        await user.click(screen.getByTestId('login-button'));
      });

      // El estado final debería ser consistente
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('diego@duoc.cl');
    });

    test('should handle localStorage sync correctly (OK)', async () => {
      render(
        <AuthWrapper>
          <TestComponent />
        </AuthWrapper>
      );

      // Login y verificar localStorage
      await act(async () => {
        await user.click(screen.getByTestId('login-button'));
      });

      let savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.email).toBe('diego@duoc.cl');

      // Logout y verificar localStorage
      await act(async () => {
        await user.click(screen.getByTestId('logout-button'));
      });

      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
