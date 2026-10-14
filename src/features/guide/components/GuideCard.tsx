import {
  CircleHelp,
  Cpu,
  Fish,
  Globe2,
  MapPin,
  Package,
  Plus,
} from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { GuideCategory, GuideEntry } from "../types/guide.types";

interface GuideCardProps {
  entry: GuideEntry;
  onAddToChecklist: (entry: GuideEntry) => void;
  addingToChecklist?: boolean;
}

const categoryIcons: Record<GuideCategory, typeof Globe2> = {
  planet: Globe2,
  species: Fish,
  place: MapPin,
  technology: Cpu,
  object: Package,
};

const classificationLabels = {
  "mostly-harmless": "Mostly harmless",
  safe: "Safe",
  caution: "Caution advised",
  dangerous: "Dangerous",
  legendary: "Legendary",
  unknown: "Unknown",
};

export function GuideCard({
  entry,
  onAddToChecklist,
  addingToChecklist = false,
}: GuideCardProps) {
  const Icon = categoryIcons[entry.category] ?? CircleHelp;

  return (
    <Card
      sx={{
        height: "100%",
        borderColor: "rgba(255,255,255,0.12)",
        transition: "border-color 200ms ease",
        "&:hover": { borderColor: "rgba(255,255,255,0.28)" },
      }}
    >
      <CardContent
        sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          mb={2.5}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{ color: "secondary.main", display: "inline-flex" }}
              aria-hidden="true"
            >
              <Icon size={18} />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "secondary.main",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {entry.category}
            </Typography>
          </Stack>

          <Chip
            size="small"
            variant="outlined"
            label={classificationLabels[entry.classification]}
            sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
          />
        </Stack>

        <Typography variant="h5" component="h2">
          {entry.name}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, flexGrow: 1, lineHeight: 1.7 }}
        >
          {entry.summary}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
          {entry.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2.5, flexWrap: "wrap" }}
          useFlexGap
        >
          <Button
            component={RouterLink}
            to={`/guide/${entry.id}`}
            size="small"
            sx={{ px: 0 }}
          >
            View full entry
          </Button>

          <Button
            size="small"
            startIcon={<Plus size={14} />}
            onClick={() => onAddToChecklist(entry)}
            disabled={addingToChecklist}
          >
            {addingToChecklist ? "Adding..." : "Add to checklist"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
