import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { ArrowLeft, Plus, ShieldAlert } from "lucide-react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useState } from "react";
import { useGuideEntry } from "../../hooks/useGuideEntry";
import { useAuth } from "../../../auth/context/AuthContext";
import { useCreateTravelTaskFromGuide } from "../../../travelTasks/hooks/useCreateTravelTaskFromGuide";
import {
  getCategoryMeta,
  getClassificationMeta,
} from "../../utils/guideDisplay";

export function GuideEntryPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const { user } = useAuth();
  const addFromGuideMutation = useCreateTravelTaskFromGuide(user?.uid);

  const [notice, setNotice] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  const { data: entry, isLoading, isError, refetch } = useGuideEntry(entryId);

  async function handleAddToChecklist() {
    if (!entry) return;

    try {
      setNoticeError(null);
      await addFromGuideMutation.mutateAsync(entry);
      setNotice(`Added "${entry.name}" to your checklist.`);
    } catch {
      setNoticeError(
        "Couldn’t add this entry to your checklist. Please try again.",
      );
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography>Loading Guide entry…</Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/guide"
          startIcon={<ArrowLeft size={16} />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to Guide
        </Button>

        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          We couldn’t load this Guide entry right now.
        </Alert>
      </Stack>
    );
  }

  if (!entry) {
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/guide"
          startIcon={<ArrowLeft size={16} />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to Guide
        </Button>

        <Alert severity="info">
          This Guide entry does not exist (or is no longer available).
        </Alert>
      </Stack>
    );
  }

  const category = getCategoryMeta(entry.category);
  const classification = getClassificationMeta(entry.classification);
  const CategoryIcon = category.icon;

  return (
    <>
      <Stack spacing={2.5}>
        <Button
          component={RouterLink}
          to="/guide"
          startIcon={<ArrowLeft size={16} />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to Guide
        </Button>

        <Card
          variant="outlined"
          sx={{ borderLeft: `4px solid ${classification.color}` }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      color: category.color,
                      bgcolor: alpha(category.color, 0.14),
                      border: `1px solid ${alpha(category.color, 0.35)}`,
                    }}
                  >
                    <CategoryIcon size={18} />
                  </Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: category.color,
                      fontWeight: 700,
                      letterSpacing: ".1em",
                    }}
                  >
                    {category.label}
                  </Typography>
                </Stack>

                <Chip
                  label={classification.label}
                  sx={{
                    fontWeight: 700,
                    color: classification.color,
                    bgcolor: alpha(classification.color, 0.14),
                    border: `1px solid ${alpha(classification.color, 0.45)}`,
                  }}
                />
              </Stack>

              <Typography variant="h3" component="h1">
                {entry.name}
              </Typography>

              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {entry.summary}
              </Typography>

              {entry.description ? (
                <Typography
                  color="text.primary"
                  sx={{
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                    overflowWrap: "anywhere",
                  }}
                >
                  {entry.description}
                </Typography>
              ) : null}

              {entry.travelAdvisory ? (
                <Alert severity="warning" icon={<ShieldAlert size={20} />}>
                  <Typography
                    variant="subtitle2"
                    component="p"
                    sx={{ mb: 0.25 }}
                  >
                    Travel advisory
                  </Typography>
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                    {entry.travelAdvisory}
                  </Typography>
                </Alert>
              ) : null}

              {entry.tags.length > 0 ? (
                <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                  {entry.tags.map((tag) => (
                    <Chip
                      key={tag}
                      size="small"
                      label={tag}
                      variant="outlined"
                      sx={{
                        color: category.color,
                        borderColor: alpha(category.color, 0.45),
                      }}
                    />
                  ))}
                </Stack>
              ) : null}

              <Button
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={handleAddToChecklist}
                disabled={addFromGuideMutation.isPending}
                sx={{ alignSelf: "flex-start" }}
              >
                {addFromGuideMutation.isPending
                  ? "Adding..."
                  : "Add to checklist"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice(null)}
        message={notice}
      />

      <Snackbar
        open={Boolean(noticeError)}
        autoHideDuration={4000}
        onClose={() => setNoticeError(null)}
        message={noticeError}
      />
    </>
  );
}
