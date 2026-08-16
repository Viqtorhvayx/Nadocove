import { AddressProfile } from "@/components/address-profile";

export default async function AddressProfilePage(
  props: PageProps<"/u/[address]">,
) {
  const { address } = await props.params;
  return <AddressProfile address={address} />;
}
