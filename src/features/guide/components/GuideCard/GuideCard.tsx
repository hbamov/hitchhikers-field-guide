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
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { GuideCategory, GuideEntry } from "../../types/guide.types";
import { getClassificationMeta } from "../../utils/guideDisplay";

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

export function GuideCard({
  entry,
  onAddToChecklist,
  addingToChecklist = false,
}: GuideCardProps) {
  const Icon = categoryIcons[entry.category] ?? CircleHelp;
  const classification = getClassificationMeta(entry.classification);

  return (
    <Card
      sx={{
        height: "100%",
        borderColor: classification.color,
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
            label={classification.label}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontWeight: 600,
              color: classification.color,
              bgcolor: alpha(classification.color, 0.14),
              border: `1px solid ${alpha(classification.color, 0.4)}`,
            }}
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
