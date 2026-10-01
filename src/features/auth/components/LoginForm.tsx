import { useState, type FormEvent } from "react";
import { useSignIn } from "@clerk/react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Input } from "../../../components/Input";
import {
  collectFieldErrors,
  loginSchema,
  type LoginFormValues,
} from "../validations/login.validation";

const emptyValues: LoginFormValues = { email: "", password: "" };

export function LoginForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isFetching = fetchStatus === "fetching";
  const emailError = fieldErrors.email ?? errors?.fields.identifier?.message;
  const passwordError = fieldErrors.password ?? errors?.fields.password?.message;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    const { error } = await signIn.password({
      emailAddress: result.data.email,
      password: result.data.password,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            navigate(url);
          }
        },
      });
      return;
    }

    if (
      signIn.status === "needs_client_trust" ||
      signIn.status === "needs_second_factor"
    ) {
      setFormError("Este método de verificación aún no está disponible.");
      return;
    }

    setFormError("No se pudo completar el inicio de sesión.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Correo electrónico"
        htmlFor="login-email"
        error={emailError}
        required
      >
        <Input
          id="login-email"
          type="email"
          value={values.email}
          autoComplete="email"
          placeholder="tu@email.com"
          invalid={Boolean(emailError)}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
        />
      </Field>

      <Field
        label="Contraseña"
        htmlFor="login-password"
        error={passwordError}
        required
      >
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(passwordError)}
            className="pr-11"
            onChange={(event) =>
              setValues((current) => ({ ...current, password: event.target.value }))
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      <Button type="submit" className="mt-2" disabled={isFetching}>
        {isFetching ? "Iniciando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
