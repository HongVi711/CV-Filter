import { ManagementLayout } from "./page/dashboard/layout";
import { ManagementPage } from "./page/dashboard/page";

export default function Home() {
  return (
    <ManagementLayout>
      <ManagementPage />
    </ManagementLayout>
  );
}
