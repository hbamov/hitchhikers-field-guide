import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Compass, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isFirebaseConfigured } from "../../../shared/firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { authMessages } from "../content/authMessages";
import { commonText } from "../../../shared/content/common";

type FormValues = { displayName?: string; email: string; password: string };

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { signInWithEmail, register, sendPasswordReset } = useAuth();

  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const schema = z
    .object({
      displayName: z.string().optional(),
      email: z.email(authMessages.validation.invalidEmail),
      password:
        mode === "login"
          ? z.string().min(1, authMessages.validation.passwordRequired)
          : z.string().min(6, authMessages.validation.passwordTooShort),
    })
    .superRefine((values, context) => {
      if (
        mode === "register" &&
        (!values.displayName || values.displayName.trim().length < 2)
      ) {
        context.addIssue({
          code: "custom",
          path: ["displayName"],
          message: authMessages.validation.nameTooShort,
        });
      }
    });

  const {
    register: field,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const title =
    mode === "login" ? authMessages.login.title : authMessages.register.title;

  async function onSubmit(values: FormValues) {
    setBusy(true);
    setFormError("");
    setNotice("");
    try {
      if (mode === "login") {
        await signInWithEmail(values.email, values.password);

        const from = (location.state as { from?: { pathname?: string } } | null)
          ?.from?.pathname;

        navigate(from || "/dashboard", { replace: true });
      } else {
        await register(
          values.displayName!.trim(),
          values.email,
          values.password,
        );

        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : authMessages.errors.unableToContinue,
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    const email = getValues("email");
    const validEmail = z.email().safeParse(email);

    if (!validEmail.success) {
      setFormError(authMessages.passwordReset.emailRequired);
      return;
    }

    setBusy(true);
    setFormError("");

    try {
      await sendPasswordReset(email);
      setNotice(authMessages.passwordReset.success);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : authMessages.passwordReset.error,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      className="min-h-screen px-4 py-10"
      sx={{
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(ellipse at 15% 15%, #1d3843 0%, transparent 40%), #101a24",
      }}
    >
      <Stack spacing={3} sx={{ width: "min(100%, 440px)" }}>
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 1.5,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              mb: 1.5,
            }}
          >
            <Compass size={28} aria-hidden="true" />
          </Box>
          <Typography
            variant="overline"
            color="secondary.main"
            sx={{ display: "block", letterSpacing: ".18em" }}
          >
            {commonText.tagline}
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={800}>
            {commonText.appName}
          </Typography>
        </Box>
        <Card elevation={8}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" component="h2">
                  {title}
                </Typography>
                <Typography color="text.secondary">
                  {mode === "login"
                    ? authMessages.login.description
                    : authMessages.register.description}
                </Typography>
              </Box>
              {!isFirebaseConfigured && (
                <Alert severity="warning">
                  {authMessages.errors.firebaseNotConfigured}
                </Alert>
              )}
              {formError && (
                <Alert severity="error" role="alert">
                  {formError}
                </Alert>
              )}
              {notice && (
                <Alert severity="success" role="status">
                  {notice}
                </Alert>
              )}
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <Stack spacing={2}>
                  {mode === "register" && (
                    <TextField
                      label="Name"
                      autoComplete="name"
                      {...field("displayName")}
                      error={!!errors.displayName}
                      helperText={errors.displayName?.message}
                    />
                  )}
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    {...field("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    {...field("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={busy || !isFirebaseConfigured}
                    endIcon={<Send size={17} />}
                  >
                    {busy
                      ? authMessages.submitting
                      : mode === "login"
                        ? authMessages.login.submit
                        : authMessages.register.submit}
                  </Button>
                </Stack>
              </Box>
              {mode === "login" && (
                <Button
                  variant="text"
                  onClick={handleReset}
                  disabled={busy || !isFirebaseConfigured}
                  sx={{ alignSelf: "flex-start", px: 0 }}
                >
                  {authMessages.passwordReset.action}
                </Button>
              )}
              <Typography variant="body2" color="text.secondary">
                {mode === "login"
                  ? authMessages.login.switchPrompt
                  : authMessages.register.switchPrompt}{" "}
                <Link
                  component={RouterLink}
                  to={mode === "login" ? "/register" : "/login"}
                  underline="hover"
                  color="primary.main"
                >
                  {mode === "login"
                    ? authMessages.login.switchLink
                    : authMessages.register.switchLink}
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {authMessages.footer}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
