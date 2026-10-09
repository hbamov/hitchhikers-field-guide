import { zodResolver } from "@hookform/resolvers/zod";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  CreateTravelTaskInput,
  TaskPriority,
  TravelTask,
} from "../../types/travelTask.types";
import { formatDateInput, parseDateInput } from "../../utils/date";

const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or fewer."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof taskSchema>;

interface TravelTaskFormProps {
  mode: "create" | "edit";
  initialTask?: TravelTask;
  onSubmit: (input: CreateTravelTaskInput) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const priorities: TaskPriority[] = ["low", "medium", "high"];

export function TravelTaskForm({
  mode,
  initialTask,
  onSubmit,
  onCancel,
  submitting = false,
}: TravelTaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialTask?.title ?? "",
      description: initialTask?.description ?? "",
      priority: initialTask?.priority ?? "medium",
      dueDate: formatDateInput(initialTask?.dueDate),
    },
  });

  const submitHandler = async (values: FormValues) => {
    await onSubmit({
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      dueDate: parseDateInput(values.dueDate ?? ""),
    });
  };

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(submitHandler)}
      noValidate
    >
      <TextField
        label="Title"
        required
        fullWidth
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        label="Description (optional)"
        fullWidth
        multiline
        minRows={3}
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <TextField
        label="Priority"
        select
        fullWidth
        defaultValue={initialTask?.priority ?? "medium"}
        {...register("priority")}
        error={!!errors.priority}
        helperText={errors.priority?.message}
      >
        {priorities.map((priority) => (
          <MenuItem key={priority} value={priority}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Due date (optional)"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        {...register("dueDate")}
        error={!!errors.dueDate}
        helperText={errors.dueDate?.message}
      />

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ pt: 1 }}
      >
        <Button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create item"
              : "Save changes"}
        </Button>
      </Stack>
    </Stack>
  );
}
