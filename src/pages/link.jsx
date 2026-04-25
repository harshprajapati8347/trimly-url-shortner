import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/db/apiClicks";
import { deleteUrl, getUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader, BeatLoader } from "react-spinners";
import { PageContainer } from "@/components/layout/page-container";
import { toast } from "sonner";

const LinkPage = () => {
  const navigate = useNavigate();
  const { user, isGuest } = UrlState();
  const { id } = useParams();

  const userId = user?.id || (isGuest ? "guest" : null);

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, { id, user_id: userId });

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

  useEffect(() => {
    if (userId) fn();
  }, [userId]);

  useEffect(() => {
    if (!error && loading === false && url) fnStats();
  }, [loading, error, url]);

  if (error) {
    navigate("/dashboard");
  }

  let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url;
  }
  const appUrl = import.meta.env.VITE_APP_URL || "https://trimly.iamharsh.in";

  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title;

    // Check if it's base64/data URI or URL
    if (imageUrl.startsWith("data:")) {
      const anchor = document.createElement("a");
      anchor.href = imageUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((e) => toast.error("Could not download QR Code"));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${appUrl}/${link}`);
    toast.success("Link copied to clipboard!");
  };

  return (
    <PageContainer className="py-10">
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="flex flex-col gap-8 sm:flex-row justify-between w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            {url?.title}
          </span>
          <a
            href={`${appUrl}/${link}`}
            target="_blank"
            className="text-lg sm:text-3xl text-primary font-bold hover:underline cursor-pointer break-all"
          >
            {appUrl}/{link}
          </a>
          <a
            href={url?.original_url}
            target="_blank"
            className="flex items-center gap-2 hover:underline cursor-pointer text-muted-foreground break-all"
          >
            <LinkIcon className="h-4 w-4 shrink-0" />
            {url?.original_url}
          </a>
          <span className="flex items-end font-light text-sm text-muted-foreground">
            Created on{" "}
            {url?.created_at && new Date(url?.created_at).toLocaleString()}
          </span>
          <div className="flex gap-2 w-full mt-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex-1 sm:flex-none"
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button
              variant="outline"
              onClick={downloadImage}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" /> QR
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.promise(
                  fnDelete().then(() => {
                    navigate("/dashboard");
                  }),
                  {
                    loading: "Deleting link...",
                    success: "Link deleted successfully!",
                    error: "Error deleting link",
                  },
                );
              }}
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          </div>

          {url?.qr && (
            <Card className="w-full sm:w-auto p-4 overflow-hidden flex items-center justify-center bg-white mt-4">
              <img
                src={url?.qr}
                className="w-full max-w-[250px] object-contain"
                alt="qr code"
              />
            </Card>
          )}
        </div>

        <div className="sm:w-3/5 flex flex-col gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-extrabold">
                Analytics
              </CardTitle>
            </CardHeader>
            {stats && stats.length > 0 ? (
              <CardContent className="flex flex-col gap-6">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.length}</p>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Location Data</h3>
                  <Location stats={stats} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Device Info</h3>
                  <DeviceStats stats={stats} />
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
                {loadingStats === false
                  ? "No clicks recorded yet for this URL."
                  : "Loading Statistics..."}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default LinkPage;
