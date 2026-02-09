# Bermy Banana Persistence Features

This document describes the complete frontend implementation of persistence features for the Bermy Banana platform.

## Overview

The persistence system allows users to save their generated outputs (images and videos) permanently, ensuring they survive browser refreshes and are available across sessions. The system includes localStorage caching with API synchronization.

## Architecture

### State Management

#### 1. PersistenceContext (`use-persistence.tsx`)
- **Purpose**: Global state management for persistent outputs
- **Features**:
  - localStorage synchronization for offline persistence
  - API synchronization for server-side storage
  - Real-time state updates across components
  - Error handling and loading states

#### 2. useGenerationPersistence Hook
- **Purpose**: Simplified persistence management for individual outputs
- **Usage**: Integrated into generation components
- **Features**:
  - Automatic persistence detection
  - One-click save/remove operations
  - Loading state management

### Core Components

#### 1. PersistenceManager
**Full-featured persistence management component**

```tsx
<PersistenceManager
  outputId="unique-output-id"
  title="My Video Title"
  type="VIDEO"
  url="https://example.com/video.mp4"
  thumbnailUrl="https://example.com/thumb.jpg"
  variant="full" // or "compact"
  showActions={true}
/>
```

**Features**:
- Complete persistence management UI
- Download functionality
- Visual persistence status
- Remove with confirmation dialog
- Responsive design

#### 2. PersistenceActions
**Simplified action buttons for integration**

```tsx
<PersistenceActions
  outputId="output-123"
  jobId="job-456"
  jobMode="MODE_A"
  jobTitle="UGC Video"
  outputType="VIDEO"
  outputUrl="https://example.com/video.mp4"
  showText={true}
  size="default"
/>
```

**Features**:
- Minimal UI footprint
- Smart button states (save/remove/saved)
- Tooltip support
- Confirmation dialogs

#### 3. SaveAsAvatarButton
**Avatar creation functionality**

```tsx
<SaveAsAvatarButton
  outputId="output-123"
  imageUrl="https://example.com/image.jpg"
  variant="outline"
  size="default"
  onSave={() => console.log('Avatar saved')}
/>
```

**Features**:
- Modal confirmation dialog
- Loading states
- Avatar preview
- Success feedback

#### 4. PersistenceIndicator
**Status indicator with tooltip**

```tsx
<PersistenceIndicator
  isPersistent={true}
  persistUntil={new Date('2024-12-31')}
  onRemove={() => console.log('Remove clicked')}
  size="md"
  showTooltip={true}
/>
```

**Features**:
- Lock icon with persistence status
- Expiration countdown
- Quick remove action
- Customizable sizes

#### 5. RecentOutputsDashboard
**Gallery view for persistent outputs**

```tsx
<RecentOutputsDashboard
  limit={12}
  showHeader={true}
  className="my-custom-class"
/>
```

**Features**:
- Grid layout with responsive design
- Filtering and sorting
- Download functionality
- Empty state handling
- Loading skeletons

## Integration Guide

### 1. Setup

#### Add Provider to Layout
```tsx
// app/layout.tsx
import { PersistenceProvider } from '@/hooks/use-persistence';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PersistenceProvider>
          {children}
        </PersistenceProvider>
      </body>
    </html>
  );
}
```

### 2. Integration Points

#### Mode A Video Generation
The persistence features are integrated into the mode-a generation flow:

```tsx
// In the output display section
<div className="p-3 space-y-3 bg-muted/50">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">
      Scene {output.sceneIndex}
    </span>
    <Button asChild variant="outline" size="sm">
      <a href={output.url} download>
        <Download className="h-4 w-4 mr-1" />
        Download
      </a>
    </Button>
  </div>
  
  {/* Persistence Actions */}
  <div className="flex items-center justify-between pt-2 border-t border-border/50">
    <PersistenceActions
      outputId={`scene-${output.sceneIndex}-${Date.now()}`}
      jobId={`mode-a-${Date.now()}`}
      jobMode="MODE_A"
      jobTitle={title || `UGC Video - Scene ${output.sceneIndex}`}
      outputType="VIDEO"
      outputUrl={output.url}
      size="sm"
      showText={false}
    />
    
    <SaveAsAvatarButton
      outputId={`scene-${output.sceneIndex}-${Date.now()}`}
      imageUrl={output.url}
      variant="ghost"
      size="sm"
    />
  </div>
</div>
```

#### Custom Output Display
For custom output displays:

```tsx
import { PersistenceManager } from '@/components/generate';

function MyOutputComponent({ output }) {
  return (
    <div className="output-container">
      {/* Your existing output display */}
      <video src={output.url} controls />
      
      {/* Add persistence */}
      <PersistenceManager
        outputId={output.id}
        title={output.title}
        type={output.type}
        url={output.url}
        thumbnailUrl={output.thumbnailUrl}
        variant="compact"
      />
    </div>
  );
}
```

### 3. Dashboard Integration

#### Navigation
Added gallery link to site header:

```tsx
// components/site-header.tsx
<Button asChild variant="ghost" size="sm" className="hidden lg:flex bg-purple-500/10 hover:bg-purple-500/20 text-purple-500">
  <Link href="/dashboard">Gallery</Link>
</Button>
```

#### Dashboard Page
Enhanced dashboard with stats and quick actions:

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Saved, Videos, Images, This Month */}
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/mode-a">Create UGC Video</Link>
          </Button>
          {/* More actions */}
        </CardContent>
      </Card>
      
      {/* Recent Outputs Dashboard */}
      <Suspense fallback={<LoadingSkeleton />}>
        <RecentOutputsDashboard />
      </Suspense>
    </div>
  );
}
```

## API Integration

### Endpoints Used

1. **GET `/api/outputs/persistent`** - Fetch user's persistent outputs
2. **POST `/api/outputs/persist`** - Save output to persistent storage
3. **DELETE `/api/outputs/{id}`** - Remove output from persistent storage
4. **POST `/api/outputs/{id}/save-as-avatar`** - Save output as avatar

### Data Flow

1. **Initial Load**:
   - Load from localStorage for immediate display
   - Sync with API for server state
   - Update localStorage with fresh data

2. **Save Operation**:
   - Update local state immediately
   - Save to localStorage for persistence
   - Sync with API
   - Show success/error feedback

3. **Remove Operation**:
   - Remove from local state
   - Update localStorage
   - Sync with API
   - Confirm removal

## Error Handling

### Strategies
- **Optimistic updates**: Update UI immediately, rollback on error
- **Retry mechanisms**: Automatic retry for failed API calls
- **User feedback**: Toast notifications for all operations
- **Graceful degradation**: Fallback to localStorage when API unavailable

### Error States
- Network connectivity issues
- API endpoint failures
- Authentication problems
- Storage quota exceeded

## Performance Considerations

### Optimizations
- **Lazy loading**: Components load data on demand
- **Caching**: localStorage for instant access
- **Debouncing**: Prevent rapid API calls
- **Virtualization**: For large output lists

### Memory Management
- Cleanup event listeners
- Proper component unmounting
- Image/video lazy loading
- Garbage collection of unused objects

## Accessibility

### Features
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: ARIA labels and descriptions
- **Focus management**: Proper focus handling
- **Color contrast**: WCAG compliant colors
- **Reduced motion**: Respect user preferences

### Implementation
```tsx
// Example accessibility features
<Button
  aria-label="Save output to gallery"
  aria-describedby="save-description"
>
  <Save className="sr-only" />
  Save to Gallery
</Button>

<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {loading ? 'Saving...' : 'Saved successfully'}
</div>
```

## Testing

### Unit Tests
- Component rendering
- State management logic
- API integration
- Error handling

### Integration Tests
- End-to-end persistence flow
- Cross-component communication
- Data synchronization

### Manual Testing
- Browser refresh scenarios
- Network disconnection/reconnection
- Large dataset performance
- Mobile responsiveness

## Deployment

### Environment Variables
```bash
# Required for persistence features
NEXT_PUBLIC_API_URL=https://api.bermybanana.com
```

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## Future Enhancements

### Planned Features
1. **Bulk Operations**: Select and manage multiple outputs
2. **Organization**: Folders and tagging system
3. **Sharing**: Public galleries and social sharing
4. **Analytics**: Usage tracking and insights
5. **Export**: Bulk download and backup features

### Scalability Improvements
1. **Infinite Scroll**: For large galleries
2. **Search**: Full-text search across outputs
3. **Filters**: Advanced filtering options
4. **Sorting**: Multiple sort criteria
5. **Collaboration**: Shared workspaces

This implementation provides a complete, production-ready persistence system that enhances user experience while maintaining performance and accessibility standards.