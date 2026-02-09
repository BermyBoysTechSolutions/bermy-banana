import { Suspense } from 'react';
import { RecentOutputsDashboard } from '@/components/generate/recent-outputs-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Image, 
  Video, 
  Clock, 
  HardDrive,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Gallery</h1>
          <p className="text-muted-foreground">
            Manage your saved outputs and track your creative journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                All your persistent outputs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Generated videos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Generated images
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                New outputs created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump into creating new content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="outline">
                  <Link href="/mode-a">
                    <Video className="mr-2 h-4 w-4" />
                    Create UGC Video
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/mode-b">
                    <Image className="mr-2 h-4 w-4" />
                    Create Product Photo
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/mode-c">
                    <Calendar className="mr-2 h-4 w-4" />
                    Multi-Scene Video
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* Recent Outputs Dashboard */}
        <Suspense
          fallback={
            <div>
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <RecentOutputsDashboard 
            limit={12}
            showHeader={true}
          />
        </Suspense>

        {/* Help Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Tips for Your Gallery</CardTitle>
              <CardDescription>
                Make the most of your persistent outputs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Save Important Outputs</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the save button on outputs you want to keep permanently. 
                    They will be available even after refreshing your browser.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Create Avatars</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the "Save as Avatar" feature to turn your favorite outputs 
                    into reference images for future generations.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Organize Your Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Use descriptive titles when generating to easily identify 
                    your outputs in the gallery.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Download for Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Download your outputs regularly to create backups 
                    outside of the platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}