"use client";
import React, { useReducer, useRef, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import RichTextEditor from "@/components/ui/rich-text-editor";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import useBackend from "@/lib/hooks/useBackend";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/user";
import { isValidFileType, profilePlaceholderImage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  displayName: z
    .string()
    .min(1, {
      message: "Title can't be empty",
    })
    .optional(),
  username: z
    .string()
    .min(4, {
      message: "That username is too short. Use atleast 4 characters",
    })
    .optional(),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  about: z.string().optional(),
  profilePicture: z
    .string()
    .refine((value) => isValidFileType(value), {
      message:
        "Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.",
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

const EditProfileForm = () => {
  const { user } = useUser();
  console.log("user", user);
  const router = useRouter();
  const { uid }:{uid: string}   = useParams() ;
  const { updateProfile, fetchProfile } = useBackend();

  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => fetchProfile(uid),
    select: (data) => {setSelectedTags(data?.tags || []);  Object.entries(data).forEach(([key, value]:[key:any, value:any])=>form.setValue(key, value)) ; return data} ,
  });
  console.log('profile',profile)

  const imageRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: profile,
  });
  const [selectedTags, setSelectedTags] = useState(profile?.tags || []);

  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    function areArraysEqual(arr1?: Array<string>, arr2?: Array<string>) {
      if (!arr1 || !arr2) return false;
      if (arr1.length !== arr2.length) return false;

      const sortedArr1 = [...arr1].sort();
      const sortedArr2 = [...arr2].sort();

      return sortedArr1.every((value, index) => value === sortedArr2[index]);
    }
    function getChanges(
      oldObj: { [key: string]: any },
      newObj: { [key: string]: any }
    ) {
      let changes: { [key: string]: any } = {};

      for (let key in newObj) {
        if (oldObj[key] !== newObj[key]) {
          changes[key] = newObj[key];
        }
      }

      return changes;
    }
    console.log("formvalues", values);
    console.log("imagerRef.current", imageRef.current?.files?.[0]);
    const updates = getChanges(profile!, values);
    !areArraysEqual(profile?.tags, selectedTags) && (updates.tags = selectedTags);
    const profilePicture = imageRef.current?.files?.[0];
    profilePicture && (updates.profilePicture = profilePicture);
    delete updates.photoURL;
    try {
      const photoURL = await updateProfile(updates);
      toast({
        title: "Profile updated!",
        variant: "success",
      });
      router.push("/dapp/profile/" + uid);
    } catch (err) {
      console.log("err", err);
      toast({
        title: "Error updating profile",
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormControl className="mb-3">
                  <>
                    <div className="w-20 h-20 rounded-full relative">
                      <Image
                        src={
                          imageRef.current?.files?.[0]
                            ? URL.createObjectURL(imageRef.current?.files?.[0])
                            : profile?.photoURL || profilePlaceholderImage
                        }
                        fill
                        placeholder={profilePlaceholderImage}
                        className="object-cover rounded-full"
                        alt={`Preview your profile picture`}
                      />
                    </div>

                    <Input
                      placeholder="New Profile Picture"
                      className="mb-4"
                      type="file"
                      {...field}
                      ref={imageRef}
                    />
                    <div className="mb-4"></div>
                  </>
                </FormControl>
                <FormLabel>Profile Picture</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-muted font-normal" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea placeholder="Say what you're about" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="flex gap-3 flex-wrap w-full">
                    {[
                      "Blockchain",
                      "Engineering",
                      "Graphic Design",
                      "Music",
                      "Web3",
                      "UX design",
                    ].map((tag, key) => {
                      const isSelected = selectedTags.includes(tag);
                      const setTags = () =>
                        setSelectedTags(
                          isSelected
                            ? selectedTags.filter(
                                (item: string) => item !== tag
                              )
                            : [...selectedTags, tag]
                        );
                      return (
                        <Button
                          type="button"
                          onClick={setTags}
                          key={`skills-tags-${tag}`}
                          className="rounded-full text-sm "
                          size="sm"
                          variant={isSelected ? "default" : "outline"}>
                          {tag}
                          {isSelected ? (
                            <Minus className="w-4 h-4 text-muted ml-2" />
                          ) : (
                            <Plus className="w-4 h-4 text-accent-2 ml-2" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end w-full">
            <Button variant="outline" className="w-[160px] mr-3">
              Cancel
            </Button>
            <Button type="submit" variant="default" className="w-[160px] ">
              Update Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProfileForm;