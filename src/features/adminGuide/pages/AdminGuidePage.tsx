import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useGuideEntries } from "../../guide/hooks/useGuideEntries";
import type { GuideEntry } from "../../guide/types/guide.types";
import { GuideEntryFormDialog } from "../components/GuideEntryFormDialog/GuideEntryFormDialog";
import { DeleteGuideEntryDialog } from "../components/DeleteGuideEntryDialog/DeleteGuideEntryDialog";

export function AdminGuidePage() {
  const { data: entries = [], isLoading, isError, refetch } = useGuideEntries();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GuideEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<GuideEntry | null>(null);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.name.localeCompare(b.name)),
    [entries],
  );

  function openCreate() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function openEdit(entry: GuideEntry) {
    setEditingEntry(entry);
    setFormOpen(true);
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography
          variant="overline"
          color="secondary.main"
          sx={{ letterSpacing: ".16em" }}
        >
          Administration
        </Typography>
        <Typography variant="h3" component="h1">
          Guide Management
        </Typography>
        <Typography color="text.secondary">
          Create, edit, and remove Guide entries.
        </Typography>
      </Stack>

      <Button
        variant="contained"
        startIcon={<Plus size={16} />}
        onClick={openCreate}
        sx={{ alignSelf: "flex-start" }}
      >
        Create Guide entry
      </Button>

      {isLoading ? (
        <Card>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={22} />
            <Typography>Loading entries…</Typography>
          </CardContent>
        </Card>
      ) : isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          Couldn’t load Guide entries.
        </Alert>
      ) : sortedEntries.length === 0 ? (
        <Alert severity="info">No Guide entries found.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {sortedEntries.map((entry) => (
            <Card key={entry.id} variant="outlined">
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1">{entry.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.id} · {entry.category} · {entry.classification}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => openEdit(entry)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setDeletingEntry(entry)}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <GuideEntryFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialEntry={editingEntry}
      />

      <DeleteGuideEntryDialog
        open={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        entry={deletingEntry}
      />
    </Stack>
  );
}
