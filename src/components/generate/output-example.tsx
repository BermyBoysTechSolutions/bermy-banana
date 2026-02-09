use client
'use client';

import { useState } from 'react';
import { PersistenceManager } from './persistence-manager';
import { SaveAsAvatarButton } from './save-as-avatar-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface OutputExampleProps {
  className?: string;
}

export function OutputExample({ className }: OutputExampleProps) {
  const [activeTab, setActiveTab] = useState('manager');

  // Example output data
  const exampleVideo = {
    id: 'example-video-123',
    title: 'My Amazing UGC Video',
    type: 'VIDEO' as const,
    url: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
  };

  const exampleImage = {
    id: 'example-image-456', 
    title: 'Product Hero Shot',
    type: 'IMAGE' as const,
    url: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://example.com/image-thumb.jpg',
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Persistence Integration Examples</CardTitle>
          <CardDescription>
            Different ways to integrate persistence features into your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manager">Manager</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="indicator">Indicator</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manager" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PersistenceManager
                  outputId={exampleVideo.id}
                  title={exampleVideo.title}
                  type={exampleVideo.type}
                  url={exampleVideo.url}
                  thumbnailUrl={exampleVideo.thumbnailUrl}
                />
                <PersistenceManager
                  outputId={exampleImage.id}
                  title={exampleImage.title}
                  type={exampleImage.type}
                  url={exampleImage.url}
                  thumbnailUrl={exampleImage.thumbnailUrl}
                  variant="compact"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Video Output</h4>
                    <p className="text-sm text-muted-foreground">Example video with persistence actions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                    <PersistenceManager
                      outputId={exampleVideo.id}
                      title={exampleVideo.title}
                      type={exampleVideo.type}
                      url={exampleVideo.url}
                      variant="compact"
                      showActions={false}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Image Output</h4>
                    <p className="text-sm text-muted-foreground">Example image with compact persistence</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                    <PersistenceManager
                      outputId={exampleImage.id}
                      title={exampleImage.title}
                      type={exampleImage.type}
                      url={exampleImage.url}
                      variant="compact"
                      showActions={false}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="indicator" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Persistent Output Example</h4>
                    <Badge variant="default">Saved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    This output is saved to your gallery and will persist across sessions.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Saved 2 hours ago • Expires in 28 days
                    </span>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Non-Persistent Output</h4>
                    <Badge variant="secondary">Not Saved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    This output is not saved and may be removed when storage is cleared.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Generated 5 minutes ago
                    </span>
                    <Button variant="outline" size="sm">
                      Save to Gallery
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="avatar" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Save as Avatar Example</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Save this output as an avatar to use it as a reference image in future generations.
                      </p>
                    </div>
                    <SaveAsAvatarButton
                      outputId={exampleImage.id}
                      imageUrl={exampleImage.url}
                      variant="outline"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}