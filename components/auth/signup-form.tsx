"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const longLink = searchParams.get("createNew");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupInput) => {
    if (!file) {
      setFileError("Profile picture is required");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      const fileName = `dp-${values.name.split(" ").join("-")}-${Math.random()}`;
      const { error: storageError } = await supabase.storage
        .from("profile_pic")
        .upload(fileName, file);
      if (storageError) throw new Error(storageError.message);

      const profilePicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile_pic/${fileName}`;

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name, profile_pic: profilePicUrl } },
      });
      if (error) throw new Error(error.message);

      toast.success("Account created successfully!");
      router.push(`/dashboard${longLink ? `?createNew=${longLink}` : ""}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Signup</CardTitle>
        <CardDescription>
          Create a free account to manage your URLs
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="Email Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-medium">
                Profile Picture
              </Label>
              <Input
                type="file"
                accept="image/*"
                className="file:bg-muted file:text-foreground file:border-0 hover:file:bg-accent"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setFileError(null);
                }}
              />
              {fileError && (
                <p className="text-sm font-medium text-destructive">
                  {fileError}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? <BeatLoader size={10} color="white" /> : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
