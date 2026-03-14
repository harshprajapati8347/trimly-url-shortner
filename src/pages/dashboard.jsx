import {useEffect, useState} from "react";
import {BarLoader} from "react-spinners";
import {Filter, Link2} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {CreateLink} from "@/components/create-link";
import LinkCard from "@/components/link-card";
import Error from "@/components/error";
import {PageContainer} from "@/components/layout/page-container";
import {EmptyState} from "@/components/ui/empty-state";

import useFetch from "@/hooks/use-fetch";

import {getUrls} from "@/db/apiUrls";
import {getClicksForUrls} from "@/db/apiClicks";
import {UrlState} from "@/context";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {user, isGuest} = UrlState();
  const userId = user?.id || (isGuest ? "guest" : null);

  const {loading, error, data: urls, fn: fnUrls} = useFetch(getUrls, userId);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    urls?.map((url) => url.id)
  );

  useEffect(() => {
    if (userId) fnUrls();
  }, [userId]);

  const filteredUrls = urls?.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Only fetch clicks for real users, guest data won't have remote clicks 
    if (urls?.length && userId !== "guest") fnClicks();
  }, [urls?.length, userId]);

  return (
    <PageContainer className="flex flex-col gap-8 py-10 w-full max-w-5xl">
      {(loading || loadingClicks) && (
        <BarLoader width={"100%"} color="#36d7b7" />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{urls?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clicks?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">My Links</h1>
        <CreateLink />
      </div>
      
      {urls?.length > 0 ? (
        <div className="relative">
          <Input
            type="text"
            placeholder="Filter Links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base rounded-md"
          />
          <Filter className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState 
            icon={Link2} 
            title="No links created yet" 
            description={
              isGuest 
              ? "You're browsing as a guest. Your links will be temporarily saved." 
              : "Create your first shortened URL to start tracking analytics."
            } 
          />
        </div>
      )}

      {error && <Error message={error?.message} />}
      
      <div className="space-y-4">
        {(filteredUrls || []).map((url, i) => (
          <LinkCard key={`link-${i}-${url.id}`} url={url} fetchUrls={fnUrls} />
        ))}
      </div>
    </PageContainer>
  );
};

export default Dashboard;
