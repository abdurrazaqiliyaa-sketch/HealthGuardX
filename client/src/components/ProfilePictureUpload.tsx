import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePictureUpload() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: userData } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const uploadMutation = useMutation({
    mutationFn: (profilePicture: string) => 
      apiRequest("POST", "/api/user/profile-picture", { profilePicture }),
    onSuccess: () => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Profile picture must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      uploadMutation.mutate(result);
    };
    reader.readAsDataURL(file);
  };

  const displayPicture = previewUrl || userData?.profilePicture;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload or update your profile picture</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={displayPicture || undefined} alt={userData?.username} />
          <AvatarFallback>
            <User className="h-16 w-16" />
          </AvatarFallback>
        </Avatar>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-profile-picture"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          data-testid="button-upload-picture"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Picture
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
