"use client";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

interface ApiKeyInputProps {
  onApiKeySubmit: (key: string) => void;
}

const formSchema = z.object({
  apiKey: z
    .string()
    .startsWith("ak_", { message: "Improperly formatted API Key!" })
    .min(20, { message: "API Key must be at least 20 characters!" }),
});

const ApiKeyInput = (props: ApiKeyInputProps) => {
  const { onApiKeySubmit } = props;
  //   const [showKey, setShowKey] = useState<boolean>(false);
  //   const [error, setError] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const {
    formState: { errors },
  } = form;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onApiKeySubmit(values.apiKey);
  };

  return (
    <div className="flex gap-2 mb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter API Key..." {...field} />
                </FormControl>
                {errors.apiKey && (
                  <FormMessage>{errors.apiKey.message}</FormMessage>
                )}
                <FormDescription>
                  Enter your private key to connect securely to the API endpoint
                </FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default ApiKeyInput;
