export interface VOD {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  userId: string;
  streamId: string;
  createdAt: string; // Date will be serialized as a string
  duration: number; // Assuming duration is in seconds
}
