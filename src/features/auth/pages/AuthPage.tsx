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
      email: z.email("Enter a valid email address."),
      password:
        mode === "login"
          ? z.string().min(1, "Enter your password.")
          : z.string().min(6, "Use at least 6 characters."),
    })
    .superRefine((values, context) => {
      if (
        mode === "register" &&
        (!values.displayName || values.displayName.trim().length < 2)
      ) {
        context.addIssue({
          code: "custom",
          path: ["displayName"],
          message: "Enter at least 2 characters.",
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
    mode === "login" ? "Welcome aboard" : "Join the next expedition";

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
          : "Unable to continue. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    const email = getValues("email");
    const validEmail = z.email().safeParse(email);

    if (!validEmail.success) {
      setFormError(
        "Enter your email address first, then choose “Forgot password?”.",
      );
      return;
    }

    setBusy(true);
    setFormError("");

    try {
      await sendPasswordReset(email);
      setNotice(
        "If an account exists for that email, a password reset link is on its way.",
      );
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not send reset email.",
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
            A FIELD GUIDE FOR THE GALAXY
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={800}>
            The Hitchhiker’s
            <br />
            Field Guide
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
                    ? "Your next stop is waiting."
                    : "Every great trip starts somewhere."}
                </Typography>
              </Box>
              {!isFirebaseConfigured && (
                <Alert severity="warning">
                  Firebase is not configured yet. Add the project values to{" "}
                  <code>.env.local</code> to enable account actions.
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
                      ? "Preparing…"
                      : mode === "login"
                        ? "Sign in"
                        : "Create traveler account"}
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
                  Forgot password?
                </Button>
              )}
              <Typography variant="body2" color="text.secondary">
                {mode === "login"
                  ? "New to this corner of space? "
                  : "Already have an account? "}
                <Link
                  component={RouterLink}
                  to={mode === "login" ? "/register" : "/login"}
                  underline="hover"
                  color="primary.main"
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Don’t panic. Keep your towel close.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
