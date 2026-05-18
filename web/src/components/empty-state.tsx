import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({ title, description }: { title?: string; description?: string }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <Skeleton className="h-14 w-14 rounded-full" />
        <CardTitle>{title ?? "No items yet"}</CardTitle>
        <CardDescription className="max-w-sm">
          {description ?? "There are no records to display right now."}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
