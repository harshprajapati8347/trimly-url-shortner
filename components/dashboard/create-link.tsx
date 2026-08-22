"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createLinkAction } from "@/lib/actions/urls";
import { createGuestUrl } from "@/lib/guest-store";
import { APP_DOMAIN } from "@/lib/constants";
import { createLinkSchema, type CreateLinkInput } from "@/lib/validations";

/**
 * Create-link dialog.
 *  - Authenticated users → `createLinkAction` Server Action (DB + Redis cache).
 *  - Guests → local-only creation in localStorage (never persisted server-side).
 */
export function CreateLink({ isGuest }: { isGuest: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = searchParams.get("createNew") ?? "";
  const [open, setOpen] = useState(Boolean(prefill));
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: { title: "", longUrl: prefill, customUrl: "" },
  });

  const longUrl = form.watch("longUrl");

  const onSubmit = async (values: CreateLinkInput) => {
    setSubmitting(true);
    try {
      if (isGuest) {
        const record = createGuestUrl(values);
        toast.success("Guest link created!");
        router.push(`/link/${record.id}`);
        return;
      }
      const res = await createLinkAction(values);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Link created!");
      router.push(`/link/${res.data.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && prefill) {
          // Clear the ?createNew= param when the dialog closes.
          router.replace("/dashboard");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
        </DialogHeader>

        {longUrl && (
          <div className="flex justify-center rounded-md bg-white p-3">
            {/* Live preview encodes the destination; the stored QR encodes the short link. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="QR preview"
              width={200}
              height={200}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                longUrl
              )}`}
            />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Short Link's Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter your Loooong URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customUrl"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Card className="p-2 text-sm whitespace-nowrap">
                      {APP_DOMAIN}
                    </Card>
                    <span>/</span>
                    <FormControl>
                      <Input placeholder="custom-link (optional)" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sm:justify-start">
              <Button type="submit" variant="destructive" disabled={submitting}>
                {submitting ? <BeatLoader size={10} color="white" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
