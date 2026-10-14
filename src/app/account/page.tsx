import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "My Account & Orders | CraveBox",
  description: "Manage your CraveBox orders, delivery addresses, rewards points, and preferences.",
};

export default function AccountPage() {
  return <AccountClient />;
}
