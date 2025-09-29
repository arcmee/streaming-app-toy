export interface Stream {
  id: string;
  userId: string;
  title: string;
  description: string;
  isLive: boolean;
  thumbnailUrl: string | null;
}
