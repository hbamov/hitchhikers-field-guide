import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
  GUIDE_CATEGORIES,
  type GuideCategory,
  type GuideClassification,
  type GuideEntry,
} from "../../guide/types/guide.types";
import { useUpsertGuideEntry } from "../hooks/useUpsertGuideEntry";

const classificationValues = [
  "mostly-harmless",
  "safe",
  "caution",
  "dangerous",
  "legendary",
  "unknown",
] as const;

const schema = z.object({
  id: z
    .string()
    .min(1, "ID is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required."),
  category: z.enum(GUIDE_CATEGORIES),
  summary: z.string().min(1, "Summary is required."),
  classification: z.enum(classificationValues),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface GuideEntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialEntry?: GuideEntry | null;
}

export function GuideEntryFormDialog({
  open,
  onClose,
  initialEntry,
}: GuideEntryFormDialogProps) {
  const isEdit = Boolean(initialEntry);
  const mutation = useUpsertGuideEntry();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaults: FormValues = useMemo(
    () => ({
      id: initialEntry?.id ?? "",
      name: initialEntry?.name ?? "",
      category: (initialEntry?.category ?? "planet") as GuideCategory,
      summary: initialEntry?.summary ?? "",
      classification: (initialEntry?.classification ??
        "unknown") as GuideClassification,
      tags: initialEntry?.tags?.join(", ") ?? "",
    }),
    [initialEntry],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: defaults,
  });

  async function onSubmit(values: FormValues) {
    try {
      setSubmitError(null);

      await mutation.mutateAsync({
        id: values.id.trim(),
        name: values.name,
        category: values.category,
        summary: values.summary,
        classification: values.classification,
        tags: values.tags ? values.tags.split(",") : [],
      });

      onClose();
    } catch {
      setSubmitError("Couldn’t save Guide entry. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEdit ? "Edit Guide entry" : "Create Guide entry"}
      </DialogTitle>
      <DialogContent>
        {submitError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        ) : null}

        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 0.5 }}
        >
          <TextField
            label="Entry ID"
            disabled={isEdit}
            {...register("id")}
            error={!!errors.id}
            helperText={errors.id?.message ?? "Example: heart-of-gold"}
          />

          <TextField
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category"
                select
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {GUIDE_CATEGORIES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="classification"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Classification"
                select
                error={!!errors.classification}
                helperText={errors.classification?.message}
              >
                {classificationValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Summary"
            multiline
            minRows={3}
            {...register("summary")}
            error={!!errors.summary}
            helperText={errors.summary?.message}
          />

          <TextField
            label="Tags (comma-separated)"
            {...register("tags")}
            error={!!errors.tags}
            helperText={errors.tags?.message}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create entry"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
