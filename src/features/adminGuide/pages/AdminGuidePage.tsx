import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  alpha,
  Chip,
  Box,
} from "@mui/material";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useGuideEntries } from "../../guide/hooks/useGuideEntries";
import type { GuideEntry } from "../../guide/types/guide.types";
import { GuideEntryFormDialog } from "../components/GuideEntryFormDialog/GuideEntryFormDialog";
import { DeleteGuideEntryDialog } from "../components/DeleteGuideEntryDialog/DeleteGuideEntryDialog";
import {
  getCategoryMeta,
  getClassificationMeta,
} from "../../guide/utils/guideDisplay";

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
        <Stack
          component="ul"
          spacing={3}
          sx={{ listStyle: "none", m: 0, p: 0 }}
        >
          {sortedEntries.map((entry) => {
            const category = getCategoryMeta(entry.category);
            const classification = getClassificationMeta(entry.classification);
            const CategoryIcon = category.icon;

            return (
              <Card
                key={entry.id}
                component="li"
                variant="outlined"
                sx={{
                  borderLeft: `4px solid ${classification.color}`,
                  transition:
                    "border-color 200ms ease, background-color 200ms ease",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 2,
                        color: category.color,
                        bgcolor: alpha(category.color, 0.14),
                        border: `1px solid ${alpha(category.color, 0.35)}`,
                      }}
                    >
                      <CategoryIcon size={22} />
                    </Box>

                    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700 }}
                        noWrap
                      >
                        {entry.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: category.color,
                            fontWeight: 600,
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {category.label}
                        </Typography>
                        <Chip
                          size="small"
                          label={classification.label}
                          sx={{
                            fontWeight: 600,
                            color: classification.color,
                            bgcolor: alpha(classification.color, 0.14),
                            border: `1px solid ${alpha(classification.color, 0.4)}`,
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={14} />}
                      onClick={() => openEdit(entry)}
                      sx={{
                        borderColor: "warning.main",
                        color: "warning.main",
                        "&:hover": {
                          borderColor: "warning.light",
                          bgcolor: (theme) =>
                            alpha(theme.palette.warning.main, 0.12),
                        },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => setDeletingEntry(entry)}
                      sx={{
                        borderColor: "error.main",
                        color: "error.main",
                        "&:hover": {
                          borderColor: "error.light",
                          bgcolor: (theme) =>
                            alpha(theme.palette.error.main, 0.12),
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
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
