import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRandomPhrase, getShareUrl } from "@/lib/utils/motivational-phrases";
import { XIcon } from "@/components/icons/x-icon";

export function MotivationalMessage() {
  const handleShare = () => {
    const phrase = getRandomPhrase("encouragement");
    const shareUrl = getShareUrl(phrase);
    window.open(shareUrl, "_blank");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Quote className="h-6 w-6 text-primary" />
          <div className="flex-1 space-y-2">
            <p className="text-lg font-medium">
              "Small steps lead to big changes. You're doing great!"
            </p>
            <p className="text-sm text-muted-foreground">
              Keep going! You've completed 3 goals this week.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 dark:bg-white"
            onClick={handleShare}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
