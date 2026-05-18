import { TasksPageClient } from "./tasks-page-client";

type TasksPageProps = {
  searchParams?: {
    status?: string | string[];
  };
};

function parseStatusFilter(value: string | string[] | undefined) {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "pending" || status === "completed") {
    return status;
  }

  return "all";
}

export default function TasksPage({ searchParams }: TasksPageProps) {
  return <TasksPageClient statusFilter={parseStatusFilter(searchParams?.status)} />;
}
