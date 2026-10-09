import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export function GuideCardSkeleton() {
  return (
    <Card aria-hidden="true" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2.5}
        >
          <Skeleton variant="rounded" width={90} height={20} />
          <Skeleton variant="rounded" width={120} height={24} />
        </Stack>

        <Skeleton variant="rounded" width="70%" height={32} />
        <Stack spacing={1} mt={2}>
          <Skeleton variant="rounded" width="100%" height={18} />
          <Skeleton variant="rounded" width="85%" height={18} />
        </Stack>

        <Stack direction="row" spacing={1} mt={3}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Stack>
      </CardContent>
    </Card>
  );
}
