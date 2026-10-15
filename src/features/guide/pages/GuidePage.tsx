import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GuideCard } from "../components/GuideCard";
import { GuideCardSkeleton } from "../components/GuideCardSkeleton/GuideCardSkeleton";
import type { GuideCategory, GuideEntry } from "../types/guide.types";
import { useGuideEntries } from "../hooks/useGuideEntries";
import { useAuth } from "../../auth/context/AuthContext";
import { useCreateTravelTaskFromGuide } from "../../travelTasks/hooks/useCreateTravelTaskFromGuide";

type CategoryFilter = "all" | GuideCategory;

const categoryFilters: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Planets", value: "planet" },
  { label: "Species", value: "species" },
  { label: "Places", value: "place" },
  { label: "Technology", value: "technology" },
  { label: "Objects", value: "object" },
];

export function GuidePage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  const addFromGuideMutation = useCreateTravelTaskFromGuide(user?.uid);

  const {
    data: guideEntries = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useGuideEntries();

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return guideEntries.filter((entry) => {
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;

      const searchableText = [entry.name, entry.summary, ...entry.tags]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [guideEntries, search, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = search.trim() !== "" || selectedCategory !== "all";

  async function handleAddToChecklist(entry: GuideEntry) {
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

  return (
    <Container
      maxWidth="lg"
      sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}
    >
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: "secondary.main",
              letterSpacing: ".18em",
              fontWeight: 600,
            }}
          >
            Galactic database
          </Typography>

          <Typography variant="h3" component="h1" sx={{ mt: 1 }}>
            The Guide
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 760 }}>
            Search the collected knowledge of the galaxy. Accuracy, completeness
            and personal safety are not guaranteed.
          </Typography>
        </Box>

        <Stack spacing={2} aria-label="Search and filter Guide entries">
          <TextField
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search planets, species, places..."
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    size="small"
                    sx={{ minWidth: 0, p: 0.5 }}
                  >
                    <X size={18} />
                  </Button>
                </InputAdornment>
              ) : undefined,
            }}
          />

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {categoryFilters.map((category) => {
              const selected = selectedCategory === category.value;
              return (
                <Chip
                  key={category.value}
                  label={category.label}
                  clickable
                  color={selected ? "secondary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => setSelectedCategory(category.value)}
                />
              );
            })}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography
            variant="caption"
            sx={{ textTransform: "uppercase", letterSpacing: ".08em" }}
          >
            {isLoading
              ? "Loading entries..."
              : `${filteredEntries.length} ${
                  filteredEntries.length === 1 ? "guide entry" : "guide entries"
                }`}
          </Typography>

          {hasActiveFilters && (
            <Button variant="text" size="small" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
            aria-busy="true"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <GuideCardSkeleton key={index} />
            ))}
          </Box>
        ) : isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Try again
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              The Guide is temporarily unavailable
            </Typography>
            <Typography variant="body2">
              Something went wrong while retrieving the collected knowledge of
              the galaxy.
            </Typography>
          </Alert>
        ) : filteredEntries.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {filteredEntries.map((entry) => (
              <GuideCard
                key={entry.id}
                entry={entry}
                onAddToChecklist={handleAddToChecklist}
                addingToChecklist={addFromGuideMutation.isPending}
              />
            ))}
          </Box>
        ) : (
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              No Guide entries found
            </Typography>
            <Typography variant="body2">
              The Guide appears to know nothing about that. Try another search
              or clear your filters.
            </Typography>
          </Alert>
        )}
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
    </Container>
  );
}
