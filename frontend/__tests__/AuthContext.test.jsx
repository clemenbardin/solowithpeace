import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

const TestConsumer = ({ onMount }) => {
  const ctx = useAuth();
  React.useEffect(() => {
    if (onMount) onMount(ctx);
  });
  return <div data-testid="loading">{ctx.loading ? 'loading' : 'ready'}</div>;
};

const renderWithAuth = (onMount) =>
  render(
    <AuthProvider>
      <TestConsumer onMount={onMount} />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialisation', () => {
    it('démarre sans utilisateur connecté', async () => {
      renderWithAuth();
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });
    });

    it('restaure la session depuis localStorage si un token existe', async () => {
      localStorage.setItem('token', 'stored-token');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, email: 'stored@test.com', name: 'Stored' }),
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/me',
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('supprime le token si la restauration de session échoue', async () => {
      localStorage.setItem('token', 'invalid-token');

      global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('login()', () => {
    it('connecte et stocke le token', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'jwt-token',
          user: { id: 1, email: 'test@test.com', name: 'Test' },
        }),
      });

      let authCtx;
      renderWithAuth((ctx) => { authCtx = ctx; });

      await waitFor(() => screen.getByTestId('loading').textContent === 'ready');

      let result;
      await act(async () => {
        result = await authCtx.login('test@test.com', 'password');
      });

      expect(result.success).toBe(true);
      expect(localStorage.getItem('token')).toBe('jwt-token');
    });

    it('retourne une erreur si les identifiants sont invalides', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Email ou mot de passe incorrect' }),
      });

      let authCtx;
      renderWithAuth((ctx) => { authCtx = ctx; });

      await waitFor(() => screen.getByTestId('loading').textContent === 'ready');

      let result;
      await act(async () => {
        result = await authCtx.login('wrong@test.com', 'wrongpass');
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('register()', () => {
    it('crée un compte et stocke le token', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'new-jwt-token',
          user: { id: 2, email: 'new@test.com', name: 'Nouveau' },
        }),
      });

      let authCtx;
      renderWithAuth((ctx) => { authCtx = ctx; });

      await waitFor(() => screen.getByTestId('loading').textContent === 'ready');

      let result;
      await act(async () => {
        result = await authCtx.register('new@test.com', 'password123', 'Nouveau');
      });

      expect(result.success).toBe(true);
      expect(localStorage.getItem('token')).toBe('new-jwt-token');
    });

    it("retourne une erreur si l'inscription échoue", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Email déjà utilisé' }),
      });

      let authCtx;
      renderWithAuth((ctx) => { authCtx = ctx; });

      await waitFor(() => screen.getByTestId('loading').textContent === 'ready');

      let result;
      await act(async () => {
        result = await authCtx.register('exist@test.com', 'password', 'User');
      });

      expect(result.success).toBe(false);
    });
  });

  describe('logout()', () => {
    it('déconnecte et supprime le token', async () => {
      localStorage.setItem('token', 'jwt-to-remove');

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, email: 'u@u.com', name: 'U' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      let authCtx;
      renderWithAuth((ctx) => { authCtx = ctx; });

      await waitFor(() => screen.getByTestId('loading').textContent === 'ready');

      await act(async () => {
        await authCtx.logout();
      });

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('fonctionne même sans token en localStorage', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

      let authCtx;
      renderWithAuth((ctx) => { authCtx = ctx; });

      await waitFor(() => screen.getByTestId('loading').textContent === 'ready');

      await act(async () => {
        await authCtx.logout();
      });

      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
