import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Cpu, Fish, Globe2, MapPin, Package, ArrowLeft } from "lucide-react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useGuideEntry } from "../hooks/useGuideEntry";
import type { GuideCategory, GuideClassification } from "../types/guide.types";

const categoryIcons: Record<GuideCategory, typeof Globe2> = {
  planet: Globe2,
  species: Fish,
  place: MapPin,
  technology: Cpu,
  object: Package,
};

const classificationLabels: Record<GuideClassification, string> = {
  "mostly-harmless": "Mostly harmless",
  safe: "Safe",
  caution: "Caution advised",
  dangerous: "Dangerous",
  legendary: "Legendary",
  unknown: "Unknown",
};

export function GuideEntryPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const { data: entry, isLoading, isError, refetch } = useGuideEntry(entryId);

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

  const Icon = categoryIcons[entry.category];

  return (
    <Stack spacing={2.5}>
      <Button
        component={RouterLink}
        to="/guide"
        startIcon={<ArrowLeft size={16} />}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to Guide
      </Button>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{ color: "secondary.main", display: "inline-flex" }}
                  aria-hidden="true"
                >
                  <Icon size={18} />
                </Box>
                <Typography
                  variant="overline"
                  sx={{ color: "secondary.main", letterSpacing: ".12em" }}
                >
                  {entry.category}
                </Typography>
              </Stack>

              <Chip
                size="small"
                variant="outlined"
                label={classificationLabels[entry.classification]}
              />
            </Stack>

            <Typography variant="h3" component="h1">
              {entry.name}
            </Typography>

            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {entry.summary}
            </Typography>

            <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
              {entry.tags.map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
