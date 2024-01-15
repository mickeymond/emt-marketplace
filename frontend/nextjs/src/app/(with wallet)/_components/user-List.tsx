import InfiniteScroll from "@/components/ui/infinite-scroller";
import useBackend from "@/lib/hooks/useBackend";
import { ProfileFilters, UserProfile } from "@/lib/types";
import { placeholderImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { PROFILE_PAGE } from "./page-links";
import { HiCheckBadge, HiOutlineFire } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/hooks/user";
import NoData from "@/components/ui/no-data";

export default function UserList({ filters, max = 5 }: { filters?: ProfileFilters, max?: number }) {
  const { fetchProfiles} = useBackend();
  const {user} = useUser();
  if (filters?.isNotFollowing && !user)
  return <NoData message="Sign in To get Suggestions" />

  return (
    <InfiniteScroll
      fetcher={fetchProfiles}
      queryKey={["profiles"]}
      itemKey={(data: UserProfile) => data.uid}
      filters={filters}
      loadingComponent=" "
      noDataMessage="No profiles found. Please try later"
      getNextPageParam={(lastPage) => {
        if(max && max<= lastPage.length) return undefined
        return lastPage[lastPage.length - 1]
      }}
      ItemComponent={({ data }: { data: UserProfile }) => (
        <Link
          key={data.uid}
          href={PROFILE_PAGE(data.uid)}
          className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
          <div className="flex items-center">
            <div className="w-10 h-10 relative">
              <Image
                fill
                className="rounded-full object-cover"
                loading="eager"
                src={data.photoURL || placeholderImage}
                alt={`${data.displayName}-photoURL`}
                quality={80}
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <p className="text-md text-foreground">{data.displayName}</p>
                {data.isExpert === true && (
                  <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />
                )}
              </div>
              <Badge>{data.skill || data.tags?.[0]}</Badge>
            </div>
          </div>
          <div className="flex items-center text-xs text-muted">
            <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
            <div className="ml-1">{data.ment || 0}</div>
          </div>
        </Link>
      )}
    />
  );
}
