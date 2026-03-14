/* eslint-disable react/prop-types */
import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { deleteUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";
import { Card } from "./ui/card";

const LinkCard = ({ url = {}, fetchUrls }) => {
  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title;

    if (!imageUrl) return;

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

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id);
  const appUrl = import.meta.env.VITE_APP_URL;
  const shortLinkWithCustom = url?.custom_url ? url?.custom_url : url.short_url;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${appUrl}/${shortLinkWithCustom}`);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Card className="flex flex-col md:flex-row gap-5 p-5 shadow-sm transition-all hover:shadow-md bg-card group border-border">
      {url?.qr && (
        <div className="shrink-0 bg-white p-2 rounded-md self-start border flex items-center justify-center">
          <img
            src={url?.qr}
            className="h-28 w-28 object-contain"
            alt="qr code"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 space-y-2">
        <Link to={`/link/${url?.id}`} className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight hover:text-primary hover:underline cursor-pointer truncate">
            {url?.title}
          </span>
          <span className="text-lg text-primary font-medium hover:underline cursor-pointer truncate mt-1">
            {appUrl}/{shortLinkWithCustom}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline cursor-pointer truncate mt-2">
            <LinkIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{url?.original_url}</span>
          </span>
          <span className="flex items-end font-light text-xs text-muted-foreground mt-4">
            {new Date(url?.created_at).toLocaleString()}
          </span>
        </Link>
      </div>

      <div className="flex sm:flex-col gap-2 shrink-0 md:justify-start">
        <Button
          variant="outline"
          size="icon"
          title="Copy Link"
          onClick={handleCopy}
          className="hover:text-primary transition-colors"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Download QR"
          onClick={downloadImage}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          title="Delete Link"
          className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            toast.promise(
              fnDelete().then(() => fetchUrls()),
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
    </Card>
  );
};

export default LinkCard;
