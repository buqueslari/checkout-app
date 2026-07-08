"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { SecretInput } from "@/components/secret-input";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="email">
          E-mail
        </label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          placeholder="admin@suaempresa.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="password">
          Senha
        </label>
        <SecretInput
          className="input"
          id="password"
          name="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>
      {state.error ? (
        <p className="text-sm font-medium" style={{ color: "var(--red)" }}>
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-primary justify-center mt-1" type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
